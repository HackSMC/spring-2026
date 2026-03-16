import { Frame, TitleBar, Modal } from "@react95/core";
import { Computer } from "@react95/icons";
import type { ReactNode, ReactElement, JSXElementConstructor } from "react";

type Win95ModalProps = {
  title: string;
  icon?: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  titleBarOptions?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  width?: React.CSSProperties["width"];
  height?: React.CSSProperties["height"];
};

export function Win95Modal({
  title,
  icon,
  titleBarOptions,
  children,
  style,
  className,
  width,
  height,
}: Win95ModalProps) {
  return (
    <Frame
      className={className}
      bgColor="$material"
      boxShadow="$out"
      padding="$2"
      role="dialog"
      style={{
        zIndex: 20,
        position: "relative",
        width: width ?? "fit-content",
        height: height ?? "fit-content",
        boxShadow: "2px 2px 0px #000000",
        ...style,
      }}
    >
      <TitleBar active={true} icon={icon} title={title} mb="$2">
        {titleBarOptions && (
          <TitleBar.OptionsBox>{titleBarOptions}</TitleBar.OptionsBox>
        )}
      </TitleBar>
      {children}
    </Frame>
  );
}

export function Win95ModalContent({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Modal.Content boxShadow="$in" bgColor="$material" style={style}>
      <div>{children}</div>
    </Modal.Content>
  );
}
