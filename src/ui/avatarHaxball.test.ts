import { describe, expect, it } from 'vitest';
import { recortarAvatarHaxball } from './avatarHaxball';

describe('recortarAvatarHaxball', () => {
  it('dos caracteres entran enteros', () => {
    expect(recortarAvatarHaxball('HC')).toBe('HC');
  });

  it('de más de dos caracteres quedan los dos primeros', () => {
    expect(recortarAvatarHaxball('ABC')).toBe('AB');
  });

  it('un emoji solo ocupa los dos lugares', () => {
    expect(recortarAvatarHaxball('⚽')).toBe('⚽');
  });

  it('un emoji después de un caracter no entra: queda el caracter', () => {
    expect(recortarAvatarHaxball('A⚽')).toBe('A');
  });

  it('dos emojis: queda el primero', () => {
    expect(recortarAvatarHaxball('⚽🔥')).toBe('⚽');
  });

  it('una bandera o un emoji compuesto cuenta como uno solo', () => {
    expect(recortarAvatarHaxball('🇦🇷')).toBe('🇦🇷');
    expect(recortarAvatarHaxball('👨‍👩‍👧x')).toBe('👨‍👩‍👧');
  });

  it('una letra con tilde combinada no se parte', () => {
    expect(recortarAvatarHaxball('ÉZ')).toBe('ÉZ');
  });

  it('sólo espacios no deja avatar', () => {
    expect(recortarAvatarHaxball('   ')).toBe('');
  });
});
