import { site } from '@/config/site';

export default function About() {
  return (
    <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed sm:text-lg">
      {site.bio}
    </p>
  );
}
