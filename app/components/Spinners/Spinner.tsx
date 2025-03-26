import { Loader2 } from "lucide-react";

const Spinner = () => {
  return (
    <div className="flex flex-col items-center gap-2 mx-auto justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{"Loading..."}</p>
    </div>
  );
};

export default Spinner;
