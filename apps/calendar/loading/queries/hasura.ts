import { useSupabaseAuth } from "components/auth/SupabaseAuthProvider";
import { formatISO } from "date-fns";
import { gql, GraphQLClient } from "graphql-request";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

type HasuraAvatar = {
  url: string;
};

type HasuraUser = {
  email: string;
};

type HasuraProfile = {
  name?: string;
  contact?: string;
  avatar?: HasuraAvatar;
  user: HasuraUser;
};

type HasuraSkill = {
  name: string;
};

type HasuraTrainerSkill = {
  id: number;
  skill: HasuraSkill;
};

export type HasuraTrainer = {
  id: string;
  about_me?: string;
  driving_license: boolean;
  dlrg_certificate: boolean;
  profile: HasuraProfile;
  trainer_skills: HasuraTrainerSkill[];
  accepted?: boolean;
};

type HasuraTrainersQuery = {
  trainers: HasuraTrainer[];
};

const trainersGql = gql`
  query TrainersQuery($where: trainers_bool_exp) {
    trainers(where: $where) {
      id
      about_me
      driving_license
      dlrg_certificate
      profile {
        name
        contact
        avatar {
          url
        }
        user {
          email
        }
      }
      trainer_skills {
        id
        skill {
          name
        }
      }
    }
  }
`;

const useHasuraClient = () => {
  const auth = useSupabaseAuth();

  return useMemo(() => {
    if (!auth.session) {
      throw new Error("Not authenticated");
    }

    return new GraphQLClient("https://schichtplan.hasura.app/v1/graphql", {
      headers: {
        Authorization: `Bearer ${auth.session.access_token}`,
      },
    });
  }, [auth.session]);
};

export const hasuraTrainers = (term: string | undefined) => [trainersGql, term];

export const useHasuraTrainersQuery = (term: string) => {
  const client = useHasuraClient();

  return useQuery(hasuraTrainers(term), async () => {
    const _ilike = term.trim().length > 0 ? `%${term}%` : undefined;

    const query = await client.request<HasuraTrainersQuery>(trainersGql, {
      where: {
        _or: _ilike && [
          { profile: { name: { _ilike } } },
          { profile: { contact: { _ilike } } },
          { profile: { user: { email: { _ilike } } } },
          { about_me: { _ilike } },
          { trainer_skills: { skill: { name: { _ilike } } } },
        ],
      },
    });

    return query.trainers;
  });
};

export const hasuraAvailTrainers = (date: number | Date) => ["hasura", "avail", "trainers", date];

export const useHasuraAvailTrainersQuery = (date: number | Date) => {
  const client = useHasuraClient();

  return useQuery(hasuraAvailTrainers(date), async () => {
    const iso = formatISO(date, { representation: "date" });

    const query = await client.request<HasuraTrainersQuery>(trainersGql, {
      where: {
        _or: [
          {
            avails: {
              _and: [{ date: { _eq: iso } }, { status: { _neq: false } }],
            },
          },
          {
            _not: {
              avails: {
                date: { _eq: iso },
              },
            },
          },
        ],
      },
    });

    return query.trainers;
  });
};
