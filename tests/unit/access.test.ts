import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import access from '../../data/access.json';
import {signIn,signOut,signedIn,checkSession} from '../../src/access';
describe('frontend access',()=>{
 beforeEach(()=>{vi.useFakeTimers();sessionStorage.clear();signOut();});
 afterEach(()=>{signOut();vi.useRealTimers();});
 it('rejects invalid credentials and accepts the configured account',()=>{
  expect(signIn(access.login,'wrong')).toBe(false);expect(signedIn.value).toBe(false);
  expect(signIn(access.login,access.password)).toBe(true);expect(signedIn.value).toBe(true);
  checkSession();expect(signedIn.value).toBe(true);
  signOut();checkSession();expect(signedIn.value).toBe(false);
 });
 it('expires after eight hours and rejects malformed saved sessions',()=>{
  signIn(access.login,access.password);vi.advanceTimersByTime(access.sessionHours*3600000);expect(signedIn.value).toBe(false);
  sessionStorage.setItem('rut-digital-session','broken');checkSession();expect(signedIn.value).toBe(false);
 });
});
