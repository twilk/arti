import { site } from '@/config/site';

/** A mailto link is the whole contact story - no form, no backend. */
export default function Contact() {
  return (
    <ul className="flex flex-col gap-2 text-[1.0625rem]">
      <li>
        <a
          href={`mailto:${site.email}`}
          className="underline decoration-rule decoration-1 underline-offset-[6px] transition-colors hover:decoration-ink"
        >
          {site.email}
        </a>
      </li>
      {site.instagram && (
        <li>
          <a
            href={`https://instagram.com/${site.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-rule decoration-1 underline-offset-[6px] transition-colors hover:decoration-ink"
          >
            Instagram
          </a>
        </li>
      )}
    </ul>
  );
}
