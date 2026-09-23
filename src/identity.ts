import identities from '../data/institute-identities.json';
import { institutes } from './data';

// Visual identities belong to the prototype; they are not official university branding.
export const neutralIdentity = { icon: 'institutes', color: '#64748B', soft: '#F0F3F7', colorName: 'Нейтральный' };
export function instituteIdentity(idOrShort: string) {
  const id = institutes.find(i => i.id === idOrShort || i.short === idOrShort)?.id;
  return id && id in identities ? identities[id as keyof typeof identities] : neutralIdentity;
}
export function instituteStyle(idOrShort: string) {
  const identity = instituteIdentity(idOrShort);
  return { '--institute-color': identity.color, '--institute-soft': identity.soft };
}
export function campusInstitutes(objectId: string) {
  return institutes.filter(i => i.objectId === objectId);
}
