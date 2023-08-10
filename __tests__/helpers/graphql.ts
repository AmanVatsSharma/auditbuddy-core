import { GraphQLResponse } from '@apollo/client';
import { schema } from '@/lib/graphql/schema';
import { execute, ExecutionResult } from 'graphql';

export async function executeGraphQL({
  query,
  variables = {},
  context = {},
}: {
  query: string;
  variables?: Record<string, any>;
  context?: Record<string, any>;
}): Promise<ExecutionResult> {
  return execute({
    schema,
    document: query,
    variableValues: variables,
    contextValue: context,
  });
} 