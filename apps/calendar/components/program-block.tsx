import { useRole } from "./auth/RoleProvider";
import { ExclamationIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { LeadProgramBlockPopover } from "components/lead-program-block";
import { WorkspacePopover } from "./layout";
import { ProgramBlock, useProgramBlocksQuery } from "supabase/program_blocks.table";
import { useTranslation } from "./translation";
import ReactDOM from "react-dom";
import { ReactNode } from "react";

export function LeadProgramBlockList({
  leadId,
  programBlockNames,
}: {
  leadId: number;
  programBlockNames: string | null | undefined;
}) {

  const role = useRole();
  const programBlocksQuery = useProgramBlocksQuery();

  if (programBlocksQuery.isLoading) {
    return (
      <div className="flex gap-1 p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-6 w-8 animate-pulse rounded bg-gray-200" />
        ))}
      </div>
    );
  }

  const blockNames = programBlockNames ? programBlockNames.split(";") : [];

  if (role === "trainer") {
    return (
      <ProgramBlockListLayout
        blocks={blockNames
          .map((name) => programBlocksQuery.data?.find((block) => block.name === name))
          .filter((block): block is ProgramBlock => !!block)}
      >
        {(block) => <LeadProgramBlockPopover key={block.id} block={block} leadId={leadId} />}
      </ProgramBlockListLayout>
    );
  }

  return (
    <ProgramBlockListLayout
      blocks={blockNames.map((name) => ({
        block: programBlocksQuery.data?.find((block) => block.name === name),
        name,
      }))}
    >
      {({ block, name }) => {
        if (!block) {
          return <ExclamationPopover key={name} blockName={name} />;
        }

        return <LeadProgramBlockPopover key={name} block={block} leadId={leadId} />;
      }}
    </ProgramBlockListLayout>
  );
}

function ProgramBlockListLayout<TBlock extends unknown>({
  blocks,
  children,
}: {
  blocks: TBlock[];
  children: (block: TBlock) => React.ReactNode;
}) {
  if (blocks.length === 0) {
    return null;
  }

  return <div className="mt-1 grid grid-cols-5">{blocks.slice(0, 5).map((block) => children(block))}</div>;
}

function ExclamationPopover({ blockName }: { blockName: string }) {
  const t = useTranslation();

  return (
    <WorkspacePopover
      description={blockName}
      className="bg-orange-500"
      button={<ExclamationIcon className="h-5 w-5 text-white" />}
      content={() => (
        <div className="flex items-center space-x-4 p-4">
          <ExclamationIcon className="h-6 w-6 text-orange-500" />
          <div>
            <p className="font-bold">{t("Unknown program block")}</p>

            <Link href="/program-blocks">
              <a className="inline-flex items-center hover:underline">
                <span>Erstellen Sie einen Programmbaustein</span>
                <ExternalLinkIcon className="h-5 w-5" />
              </a>
            </Link>
          </div>
        </div>
      )}
    />
  );
}

export const PortalModal = ({ children }: { children: ReactNode }) => {
  return ReactDOM.createPortal(
    <div className="modal absolute top-[212px] z-20">{children}</div>,
    document.querySelector(".show-program-blocks") || (document.querySelector("#__next") as HTMLElement),
  );
};

export type DraftProgramBlock = Omit<ProgramBlock, "id" | "created_at"> & {
  id?: number;
  created_at?: string;
};
