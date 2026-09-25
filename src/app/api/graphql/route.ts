import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../../../graphql/schema';
import { resolvers } from '../../../graphql/resolvers';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

import { Session } from 'next-auth';

interface GraphQLContext {
  session: Session | null;
}

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async (req, res) => {
    console.log("GraphQL Context Recompiled");
    const session = await getServerSession(authOptions);
    if (session?.user?.email && !session.user.id) {
      const { prisma } = await import('../../../lib/prisma');
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (dbUser) {
        session.user.id = dbUser.id;
      }
    }
    return { session };
  },
});

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
