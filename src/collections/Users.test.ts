import { describe, expect, it, vi } from 'vitest';

import { Users } from './Users';

const admin = { id: 1, role: 'admin' };
const student = { id: 7, role: 'student' };

const access = Users.access;
const roleField = Users.fields.find(
  (field) => 'name' in field && field.name === 'role'
) as { access?: { create?: unknown; update?: unknown } };

const countMock = vi.fn();
const reqWith = (user: unknown) => ({ req: { payload: { count: countMock }, user } }) as never;

describe('users collection access', () => {
  it('lets an admin read and update anyone', async () => {
    expect(await access?.read?.(reqWith(admin))).toBe(true);
    expect(await access?.update?.(reqWith(admin))).toBe(true);
    expect(await access?.delete?.(reqWith(admin))).toBe(true);
  });

  it('limits a student to their own document', async () => {
    const constraint = { id: { equals: student.id } };

    expect(await access?.read?.(reqWith(student))).toEqual(constraint);
    expect(await access?.update?.(reqWith(student))).toEqual(constraint);
  });

  it('denies anonymous visitors and blocks students from deleting accounts', async () => {
    expect(await access?.read?.(reqWith(null))).toBe(false);
    expect(await access?.update?.(reqWith(null))).toBe(false);
    expect(await access?.delete?.(reqWith(student))).toBe(false);
  });

  it('allows creating accounts only for admins, plus the very first user', async () => {
    countMock.mockResolvedValue({ totalDocs: 3 });
    expect(await access?.create?.(reqWith(student))).toBe(false);
    expect(await access?.create?.(reqWith(null))).toBe(false);
    expect(await access?.create?.(reqWith(admin))).toBe(true);

    countMock.mockResolvedValue({ totalDocs: 0 });
    expect(await access?.create?.(reqWith(null))).toBe(true);
  });

  it('keeps the role field writable by admins only', async () => {
    const create = roleField.access?.create as (args: never) => boolean;
    const update = roleField.access?.update as (args: never) => boolean;

    expect(update(reqWith(student))).toBe(false);
    expect(create(reqWith(student))).toBe(false);
    expect(update(reqWith(admin))).toBe(true);
  });
});
