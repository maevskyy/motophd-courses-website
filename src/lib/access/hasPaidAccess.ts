import type { DefaultDocumentIDType, Payload } from 'payload';

type RelationValue =
  | DefaultDocumentIDType
  | { id?: DefaultDocumentIDType; role?: string }
  | null
  | undefined;

const getId = (value: RelationValue) => {
  if (value && typeof value === 'object') {
    return value.id;
  }

  return value;
};

export const isAdminUser = (user: { role?: string } | null | undefined) => user?.role === 'admin';

// Админ видит любой курс без покупки: иначе проверить курс можно было бы
// только купив его.
export const hasPaidAccess = async (
  payload: Payload,
  user: RelationValue,
  course: RelationValue
) => {
  if (user && typeof user === 'object' && isAdminUser(user)) {
    return true;
  }

  const userId = getId(user);
  const courseId = getId(course);

  if (!userId || !courseId) {
    return false;
  }

  const purchases = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        {
          user: {
            equals: userId
          }
        },
        {
          course: {
            equals: courseId
          }
        },
        {
          status: {
            equals: 'paid'
          }
        }
      ]
    }
  });

  return purchases.totalDocs > 0;
};
