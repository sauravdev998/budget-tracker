import Logo from "@/components/Logo";

type props = {
  children: React.ReactNode;
};

function layout({ children }: props) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <Logo />
      <div className="mt-12">{children}</div>
    </div>
  );
}
export default layout;
