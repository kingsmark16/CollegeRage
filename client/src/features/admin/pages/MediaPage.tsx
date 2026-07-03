import { ImagePlus, Upload } from 'lucide-react';

const MediaPage = () => {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Media</p>
        <h1 className="mt-3 font-heading text-4xl text-[#f2ede4]">Image and video workspace</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#beb7af]">
          This section is reserved for the broader media management workflow built on your Dropbox and Prisma upload
          system.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="border border-white/10 bg-[#151818] p-6">
          <div className="flex items-center gap-3 text-[#c79a31]">
            <Upload className="size-5" />
            <p className="text-xs uppercase tracking-[0.22em]">Current direction</p>
          </div>
          <p className="mt-4 text-lg font-semibold">Uploads already live in the backend</p>
          <p className="mt-3 text-sm leading-7 text-[#beb7af]">
            Your server already supports Dropbox-backed media upload, variant generation, metadata editing, and delete
            cleanup.
          </p>
        </article>

        <article className="border border-white/10 bg-[#151818] p-6">
          <div className="flex items-center gap-3 text-[#c79a31]">
            <ImagePlus className="size-5" />
            <p className="text-xs uppercase tracking-[0.22em]">Next UI step</p>
          </div>
          <p className="mt-4 text-lg font-semibold">Admin browsing and editing tools</p>
          <p className="mt-3 text-sm leading-7 text-[#beb7af]">
            The dashboard shell is ready for listing uploaded media, editing descriptions, and controlling visibility.
          </p>
        </article>
      </section>
    </div>
  );
};

export default MediaPage;
