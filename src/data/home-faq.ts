/**
 * Home page FAQ — the single source of truth.
 *
 * Both the visible accordion (components/Faq.astro) and the FAQPage JSON-LD
 * (layouts/Base.astro) render from this array, so they cannot drift apart.
 *
 * They HAD drifted: before this file existed, 4 of 6 answers differed between
 * the page and the schema. Google requires FAQPage answer text to match what a
 * visitor actually sees, so a mismatch risks losing the rich result or drawing a
 * structured-data manual action. One array makes that failure impossible rather
 * than merely fixed.
 *
 * Every answer must trace to clarive-seo/product/product-facts.md §1.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const homeFaq: FaqItem[] = [
  {
    q: "What is a listening device?",
    a: "A listening device is any tool that helps amplify or capture sound to make it easier to hear. Traditional listening devices include hearing aids and assistive listening systems. Clarive turns your iPhone into a digital listening device, using the built-in microphone and your headphones to amplify the world around you in real time, with no extra hardware needed.",
  },
  {
    q: "Is Clarive the best listening device app for iPhone?",
    a: "Clarive is purpose-built for iPhone and requires no extra hardware. Just plug in any headphones. It combines real-time amplification, live captions in 40+ languages, and smart environment presets in one app, making it one of the most complete assistive listening solutions available on iOS. It works on any iPhone running iOS 17 or later.",
  },
  {
    q: "How does a listening device that connects to a phone work?",
    a: "Clarive uses your iPhone's microphone to capture ambient sound, then processes it through the app and plays it back through your headphones with amplification applied, in real time. Bluetooth headphones, AirPods, and wired EarPods all work. There is no external hardware to buy, and it works the moment you open the app.",
  },
  {
    q: "What is an assistive listening device?",
    a: "An assistive listening device (ALD) is technology designed to help people with hearing difficulty hear more clearly. ALDs include hearing loops, FM systems, and phone-based apps like Clarive. Unlike traditional ALDs that require specialized hardware, Clarive works on any iPhone running iOS 17 or later. Just connect your headphones and open the app.",
  },
  {
    q: "Does Clarive work without an internet connection?",
    a: "Yes. Audio amplification works completely offline. Live captions use Apple's on-device speech recognition, which also works offline after the first language model download. No Wi-Fi or mobile data required once set up.",
  },
  {
    q: "What headphones work with Clarive?",
    a: "Any headphones that connect to your iPhone work: AirPods, wired EarPods, Bluetooth earphones, over-ear or in-ear headphones. Unlike Apple's Live Listen, you do not need AirPods or an MFi hearing device. Clarive works with whatever headphones you already own. No special hardware to buy.",
  },
  {
    q: "Is Clarive free?",
    a: "Clarive is free to download and includes a limited free tier. Unlimited use is a paid upgrade, available as weekly, monthly, yearly, or one-time lifetime plans, with free trials on some of them. Check the App Store listing for current pricing.",
  },
];
