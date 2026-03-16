import { BundyCampusMapsModal, ReadmeModal, SMCCampusModal } from "./modals";

export function MobileModalsSection() {
  return (
    <div className="sm:hidden block px-4 py-8 w-full">
      <div className="gap-3 grid grid-cols-2 w-full">
        <div className="flex flex-col justify-end">
          <SMCCampusModal style={{ position: "static", width: "100%" }} />
        </div>
        <div className="flex flex-col">
          <ReadmeModal style={{ position: "static", width: "100%" }} />
        </div>

        <div className="place-content-center grid col-span-2">
          <BundyCampusMapsModal style={{ position: "static", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
