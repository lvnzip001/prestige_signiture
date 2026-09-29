import { test, expect } from '@playwright/test';
test('admin saves one notification address and reloads it from settings', async ({page}) => {
  await page.route('https://esm.sh/@supabase/supabase-js@2.58.0', route=>route.fulfill({contentType:'text/javascript',body:`
    let settings={notification_to:'nwimbley@prestigesignaturestandard.com',enabled:false};
    export function createClient(){return {from(table){return {select(){return this},eq(){return this},order(){return this},limit(){return this},update(values){if(Object.keys(values).join()!=='notification_to')throw Error('Unexpected setting');settings={...settings,...values};return this},maybeSingle(){return Promise.resolve({data:{email:'admin@example.com'}})},single(){return Promise.resolve({data:settings})},then(resolve){resolve({data:[],error:null})}}},auth:{getSession:async()=>({data:{session:{user:{email:'admin@example.com'},access_token:'test'}}}),onAuthStateChange(){}}}}
  `}));
  await page.route('**/api/admin-team',route=>route.fulfill({json:{admins:[]}}));
  await page.goto('/admin.html');
  await page.getByRole('tab',{name:'Email',exact:true}).click();
  const address=page.getByLabel('Admin email address');
  await expect(address).toHaveValue('nwimbley@prestigesignaturestandard.com');
  await address.fill('office@example.com');
  await page.getByRole('button',{name:'Save email address'}).click();
  await expect(page.locator('[data-email-status]')).toContainText('Saved.');
  await page.getByRole('button',{name:'Refresh inquiries'}).click();
  await expect(address).toHaveValue('office@example.com');
  await expect(page.locator('[data-email-editor]')).toHaveCount(0);
  await expect(page.locator('[data-email-log]')).toContainText('No inquiries yet.');
});
test('admin email tab exposes notification address and safely reports missing setup', async ({page}) => {
  await page.route('https://esm.sh/@supabase/supabase-js@2.58.0', route=>route.fulfill({contentType:'text/javascript',body:`export function createClient(){const q={select(){return this},eq(){return this},order(){return this},limit(){return this},maybeSingle(){return Promise.resolve({data:{email:'admin@example.com'}})},single(){return Promise.resolve({error:{message:'not deployed'}})},then(resolve){resolve({data:[],error:null})}};return {from(){return Object.create(q)},auth:{getSession:async()=>({data:{session:{user:{email:'admin@example.com'},access_token:'test'}}}),onAuthStateChange(){},signOut:async()=>{}}}}`}));
  await page.route('**/api/admin-team',route=>route.fulfill({json:{admins:[]}}));
  await page.goto('/admin.html');
  await page.getByRole('tab',{name:'Email',exact:true}).click();
  await expect(page.locator('[data-email-status]')).toContainText('Apply the email migrations');
  await expect(page.getByLabel('Admin email address')).toBeDisabled();
  await expect(page.getByRole('tabpanel',{name:'Email',exact:true})).toBeVisible();
});
test('online inquiry preserves fields on failure and confirms only accepted requests', async ({page}) => {
  await page.route('**/assets/js/booking-config.mjs', async route => {
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('inquiryEndpoint: null',"inquiryEndpoint: '/api/inquiry'").replace('turnstileSiteKey: null',"turnstileSiteKey: 'test'")});
  });
  await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({contentType:'text/javascript',body:`window.turnstile={render(el,opts){opts.callback('test');return 1},reset(){}}`}));
  await page.route('**/api/inquiry',route=>route.fulfill({status:503,json:{message:'Please try again.'}}));
  await page.goto('/contact.html');
  const form=page.locator('main [data-inquiry-form]').first();
  for(const name of ['name','company','phone','city_state','desired_timing']) await form.locator('[name="'+name+'"]').fill('Test details');
  await form.locator('[name="email"]').fill('test@example.com');
  await form.locator('[name="employee_count"]').fill('2');
  await form.locator('[name="industry"]').selectOption({index:1});
  await form.locator('[name="training_interest"]').selectOption({index:1});
  await form.locator('[name="consent"]').check();
  await expect(form.getByRole('button',{name:'Submit My Inquiry'})).toBeVisible();
  await form.getByRole('button',{name:'Submit My Inquiry'}).click();
  await expect(form.locator('[data-form-result]')).toContainText('entries are preserved');
  await expect(form.locator('[name="email"]')).toHaveValue('test@example.com');
});
test('admin lists an inquiry and deletes it from the desk', async ({ page }) => {
  await page.route('https://esm.sh/@supabase/supabase-js@2.58.0', route => route.fulfill({ contentType: 'text/javascript', body: `
    let inquiries=[{id:'550e8400-e29b-41d4-a716-446655440000',email:'guest@example.com',created_at:'2026-09-29T15:00:00Z',details:{name:'Guest',company:'Harbor Hotel',email:'guest@example.com',phone:'501-555-0100',industry:'Hotel',employee_count:'4',city_state:'Bryant, Arkansas',training_interest:'Half-Day',desired_timing:'November',title:'Director',service_challenge:'The greeting is uneven.'}}];
    const settings={notification_to:'desk@example.com',enabled:false};
    export function createClient(){return {from(table){const chain={select(){return this},eq(){return this},order(){return this},limit(){return this},update(){return this},maybeSingle(){return Promise.resolve({data:table==='admins'?{email:'admin@example.com',must_change_password:false}:null})},single(){return Promise.resolve({data:settings})},then(resolve){resolve(table==='inquiries'?{data:inquiries,error:null}:{data:[],error:null})}};return chain},rpc(name,args){if(name==='delete_inquiry')inquiries=inquiries.filter(row=>row.id!==args.p_id);return Promise.resolve({error:null})},auth:{getSession:async()=>({data:{session:{user:{email:'admin@example.com'},access_token:'test'}}}),onAuthStateChange(){}}}}
  ` }));
  await page.route('**/api/admin-team', route => route.fulfill({ json: { admins: [] } }));
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/admin.html');
  await page.getByRole('tab', { name: 'Email', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Guest' })).toBeVisible();
  await expect(page.locator('[data-email-log]')).toContainText('Harbor Hotel');
  await expect(page.locator('[data-email-log]')).toContainText('The greeting is uneven.');
  await page.getByRole('button', { name: 'Delete inquiry from Guest' }).click();
  await expect(page.locator('[data-email-log]')).toContainText('No inquiries yet.');
  await expect(page.locator('[data-email-status]')).toContainText('Inquiry deleted.');
});
