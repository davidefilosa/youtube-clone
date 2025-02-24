import { ResponsiveDialog } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

interface ThumbanilUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const ThumbanilUploadModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbanilUploadModalProps) => {
  const utils = trpc.useUtils();
  const onUploadComplete = () => {
    onOpenChange(false);
    utils.studio.getOne.invalidate({ id: videoId });
  };
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upload a thumbnail"
    >
      <UploadDropzone
        endpoint={"thumbnailUploader"}
        input={{ videoId }}
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveDialog>
  );
};
