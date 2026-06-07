import { CognitoJwtVerifier } from "aws-jwt-verify";

type VerifiedMealLogToken = {
  accessToken: string;
  sub: string;
};

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (verifier) {
    return verifier;
  }

  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;

  if (!userPoolId) {
    throw new Error(
      "Missing NEXT_PUBLIC_COGNITO_USER_POOL_ID environment variable.",
    );
  }

  if (!userPoolClientId) {
    throw new Error(
      "Missing NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID environment variable.",
    );
  }

  verifier = CognitoJwtVerifier.create({
    userPoolId,
    tokenUse: "access",
    clientId: userPoolClientId,
  });

  return verifier;
}

function getBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    throw new Error("Missing Authorization header.");
  }

  const [scheme, token, ...rest] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token || rest.length > 0) {
    throw new Error("Authorization header must use Bearer auth.");
  }

  return token;
}

export async function verifyMealLogAccessToken(
  authorizationHeader: string | null,
): Promise<VerifiedMealLogToken> {
  const token = getBearerToken(authorizationHeader);
  const payload = await getVerifier().verify(token);
  return {
    accessToken: token,
    sub: payload.sub,
  };
}
