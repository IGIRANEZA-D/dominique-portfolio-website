import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <main className="global-main">{children}</main>
    </>
  );
}

