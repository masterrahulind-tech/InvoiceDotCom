import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const AUTH_COOKIE_NAME = "invoicedotcom_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev_jwt_secret_replace_in_production"
);

export interface SessionPayload {
  userId: string;
  identifier: string;
  name: string;
}

export async function createSession(user: {
  id: string;
  identifier: string;
  name: string;
}): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    identifier: user.identifier,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      businessProfiles: {
        include: {
          paymentMethods: true,
        },
      },
      businessMembers: {
        include: {
          businessProfile: {
            include: {
              paymentMethods: true,
            }
          },
          branch: true
        }
      }
    },
  });

  return user;
}

export async function requireRole(userId: string, businessProfileId: string, allowedRoles: string[]) {
  const member = await prisma.businessMember.findUnique({
    where: {
      userId_businessProfileId: {
        userId,
        businessProfileId
      }
    }
  });

  if (!member) return false;
  if (!allowedRoles.includes(member.role)) return false;
  if (member.status !== "ACTIVE") return false;

  return true;
}
