import {afterEach,expect,it,vi} from 'vitest';
import {mount} from '@vue/test-utils';
import LoginApp from '../../src/LoginApp.vue';
import {signedIn,signOut} from '../../src/access';
import access from '../../data/access.json';
afterEach(()=>{signOut();vi.unstubAllGlobals();});
it('rejects invalid credentials locally without revealing them in an error',async()=>{
 const request=vi.fn();vi.stubGlobal('fetch',request);
 const page=mount(LoginApp);expect(page.findAll('form')).toHaveLength(1);expect(page.text()).not.toMatch(/демо|прототип/i);
 await page.get('input[autocomplete="username"]').setValue('operator');await page.get('input[type="password"]').setValue('wrong');await page.get('form').trigger('submit');
 expect(request).not.toHaveBeenCalled();expect(signedIn.value).toBe(false);expect(page.get('[role="alert"]').text()).toBe('Неверный логин или пароль.');page.unmount();
});
it('allows valid login even when no server is available',async()=>{
 const request=vi.fn().mockRejectedValue(Error('Offline'));vi.stubGlobal('fetch',request);const page=mount(LoginApp);
 await page.get('input[autocomplete="username"]').setValue(access.login);await page.get('input[type="password"]').setValue(access.password);await page.get('form').trigger('submit');
 expect(signedIn.value).toBe(true);expect(request).not.toHaveBeenCalled();expect(page.find('[role="alert"]').exists()).toBe(false);page.unmount();
});
