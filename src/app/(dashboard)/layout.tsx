import Navbar from "@/components/Navbar";

type props = {
  children: React.ReactNode;
};
function layout({ children }: props) {
  return (
    <div className="relative flex h-screen w-full flex-col">
      <Navbar /> <div className="w-full">{children}</div>
    </div>
  );
}
export default layout;
