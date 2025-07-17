import { formatDistance } from "date-fns";

import prisma from "@/models/db";
import List from "@/components/List";
import Title from "@/components/Title";
import { worstCheck } from "@/utils/checks";
import Platform from "@/components/stats/Platform";

export default async function Page() {
  const repositories = await prisma.repository.findMany({
    include: {
      checks: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      _count: {
        select: { checks: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const reposWithChecks = repositories.filter((repo) => repo.checks.length > 0);

  return (
    <>
      <Title text={`Repo list (${reposWithChecks.length})`} />
      <Platform repositories={repositories} />
      <List
        data={reposWithChecks.map((repo) => {
  const check = repo.checks[0];

  return {
    id: repo.id,
    href: `/repo/report/${check.id}`,
    title: `${repo.owner} / ${repo.repo}`,
    status: worstCheck(check),
    description: `Added ${formatDistance(repo.createdAt, new Date(), {
      addSuffix: true,
    })}`,
    extra: `Last check performed ${formatDistance(
      check.createdAt,
      new Date(),
      { addSuffix: true }
    )} with ${check.red} error(s), ${check.amber} warning(s), ${check.green} success(es)`,
  };
})}

      />
    </>
  );
}
