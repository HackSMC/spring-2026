import { BundyCampusMapsModal, ReadmeModal, SMCCampusModal } from "./modals";

export function MobileModalsSection() {
  return (
    <div className="xl:hidden flex flex-col items-center gap-3 px-4 py-8 w-full">
      <div className="flex flex-row flex-wrap justify-center gap-1">
        <div className="flex flex-col justify-end">
          <SMCCampusModal style={{ position: "relative" }} />
        </div>
        <ReadmeModal style={{ position: "relative" }} />
      </div>
      <BundyCampusMapsModal style={{ position: "relative" }} />
    </div>
  );
}
