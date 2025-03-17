import Navbar from "@/components/Navbar";

type props = {
  children: React.ReactNode;
};
function layout({ children }: props) {
  return (
    <div className="relative flex flex-col h-screen w-full">
      <Navbar /> <div className="w-full">{children}</div>
    </div>
  );
}
export default layout;
