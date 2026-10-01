// Execute the real booking migrations in an isolated PostgreSQL engine.
// No production data, payments, forms or email providers are contacted.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite();
// Freeze only this isolated database clock for deterministic opening/cutoff checks.
await db.exec("create or replace function pg_catalog.now() returns timestamptz language sql stable as $$ select '2035-11-01T12:00:00Z'::timestamptz $$;");
await db.exec(`create role anon; create role authenticated; create role service_role;
  create schema auth;
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb
  $$;`);
for (const file of ['20260928220000_booking.sql','20260928235000_hold_hours_and_links.sql','20261001010000_booking_conflict_protection.sql']) {
  await db.exec(await readFile(`supabase/migrations/${file}`, 'utf8'));
}
await db.exec(`set request.jwt.claims='{"email":"nwimbley@prestigesignaturestandard.com"}';`);
let checks = 0;
const run = async (name, fn) => { await db.exec('truncate public.bookings, public.closures'); await fn(); checks++; console.log(`PASS ${name}`); };
let n = 0;
async function book({ kind='enrollment', program='half-day', date='2035-11-05', session=program==='half-day'?'AM':'DAY', email=`person${++n}@example.com`, payment=kind==='enrollment'?'enrollment':'deposit' } = {}) {
  return (await db.query('select public.create_booking($1,$2,$3::date,$4,$5,$6,$7,$8,$9,$10,$11) as result', [kind,program,date,session,payment,'QA Guest',email,'5015550100','QA Company','QA agreement',`${kind}:${program}:${date}:${session}`])).rows[0].result;
}
async function slot(kind, program, dates, session) { return (await db.query('select * from public.assess_slot($1,$2,$3::date[],$4)',[kind,program,dates,session])).rows[0]; }
const id = async reference => (await db.query('select id from public.bookings where reference=$1',[reference])).rows[0].id;
await run('dates begin November 2; weekdays and multi-day training blocks', async () => {
  await assert.rejects(book({date:'2026-10-30'}), /not open/);
  await assert.rejects(book({date:'2035-11-03'}), /weekday/);
  const dates=(await db.query("select public.training_dates('2035-11-09',2)::text as two, public.training_dates('2035-11-09',5)::text as five")).rows[0];
  assert.equal(dates.two,'{2035-11-09,2035-11-12}');
  assert.equal(dates.five,'{2035-11-09,2035-11-12,2035-11-13,2035-11-14,2035-11-15}');
});
await run('pending private AM blocks conflict but leaves PM free', async () => {
  await book({kind:'private'});
  await assert.rejects(book({kind:'private'}),/just filled/);
  await assert.rejects(book(),/just filled/);
  assert.equal((await slot('private','half-day',['2035-11-05'],'PM')).remaining,1);
  await book({kind:'private',session:'PM'});
  await assert.rejects(book({kind:'private',program:'full-day'}),/just filled/);
});
await run('two-day and five-day requests protect every training day', async () => {
  await book({kind:'private',program:'two-day'});
  await assert.rejects(book({date:'2035-11-06'}),/just filled/);
  await book({kind:'private',program:'full-academy',date:'2035-11-07'});
  await assert.rejects(book({date:'2035-11-13',session:'PM'}),/just filled/);
});
await run('cohort capacity includes valid holds, rejects seat 26 and conflicting programs', async () => {
  const first=await book();
  assert.equal((await slot('enrollment','half-day',['2035-11-05'],'AM')).cohort,false);
  await db.query('select public.confirm_booking($1)',[await id(first.reference)]);
  assert.equal((await slot('enrollment','half-day',['2035-11-05'],'AM')).cohort,true);
  for(let i=1;i<25;i++) await book();
  const full=await slot('enrollment','half-day',['2035-11-05'],'AM');
  assert.equal(full.status,'full'); assert.equal(full.remaining,0);
  await assert.rejects(book(),/just filled/);
  await assert.rejects(book({program:'full-day'}),/just filled/);
  assert.equal((await slot('enrollment','half-day',['2035-11-05'],'PM')).remaining,25);
});
await run('retry reuses booking and carries selection in stored reference', async () => {
  const first=await book({email:'same@example.com'}), again=await book({email:'same@example.com'});
  assert.equal(first.reference,again.reference);
  assert.equal(new URL(first.checkoutUrl).searchParams.get('client_reference_id'),first.reference);
  assert.equal((await db.query('select count(*)::int as n from public.bookings')).rows[0].n,1);
});
await run('expiry frees availability and status endpoint immediately reports expired', async () => {
  const first=await book({kind:'private'});
  await db.exec("update public.bookings set hold_until=now()-interval '1 minute'");
  assert.equal((await db.query('select public.booking_status($1) as status',[first.reference])).rows[0].status,'expired');
  await book({kind:'private'});
  await assert.rejects(db.query('select public.confirm_booking($1)',[await id(first.reference)]),/no longer available/);
});
await run('manual confirmation persists reservation; release frees it', async () => {
  const booking=await book({kind:'private'}); const bookingId=await id(booking.reference);
  await db.query('select public.confirm_booking($1)',[bookingId]);
  assert.equal((await db.query('select public.booking_status($1) as status',[booking.reference])).rows[0].status,'confirmed');
  await assert.rejects(db.query('select public.confirm_booking($1)',[bookingId]),/cannot be confirmed/);
  await db.query('select public.release_booking($1)',[bookingId]);
  await book({kind:'private'});
});
await run('manual closure prevents new bookings and late confirmation', async () => {
  const booking=await book();
  await db.exec("select public.close_date('2035-11-05','AM','QA closure')");
  await assert.rejects(book(),/closed/);
  await assert.rejects(db.query('select public.confirm_booking($1)',[await id(booking.reference)]),/no longer available/);
  await book({session:'PM'});
});
await run('48-hour cutoff rejects imminent sessions', async () => {
  await assert.rejects(book({date:'2035-11-02'}),/closed/);
  await book({date:'2035-11-05'});
});
await run('non-admin cannot confirm, release or close dates', async () => {
  const booking=await book();
  await db.exec("set request.jwt.claims='{}'; set role authenticated;");
  await assert.rejects(db.query('select public.confirm_booking($1)',[await idAsOwner(booking.reference)]),/Not allowed/);
  await assert.rejects(db.query('select public.release_booking($1)',[await idAsOwner(booking.reference)]),/Not allowed/);
  await assert.rejects(db.query("select public.close_date('2035-11-05','AM','')"),/Not allowed/);
  await db.exec('reset role');
});
async function idAsOwner(reference) {
  await db.exec('reset role'); const result=await id(reference); await db.exec('set role authenticated'); return result;
}
await db.close();
console.log(`${checks} database scenarios passed. Separate-session concurrency still requires staging PostgreSQL verification.`);
