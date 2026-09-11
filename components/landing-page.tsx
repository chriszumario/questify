import { Button } from "@/components/ui/button"
import { Sparkles, BarChart3, Zap, Users, GraduationCap, TrendingUp, CheckCircle2, ArrowRight, PlayCircle, BrainCircuit, Share2, MousePointerClick } from "lucide-react"
import { Link } from "@/i18n/routing"
import { LanguageSwitcher } from "@/components/language-switcher"

import { useTranslations } from 'next-intl'

export function LandingPage() {
  const t = useTranslations('HomePage')

  return (
    // Forcing dark theme aesthetics for the landing page
    <div className="dark min-h-screen bg-black text-white selection:bg-primary/30 flex flex-col font-sans overflow-x-hidden">
      {/* Deep Background Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none -z-10 mix-blend-screen"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none -z-10 mix-blend-screen"></div>
      
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter flex items-center gap-2 text-white">
            <div className="flex w-8 h-8 rounded-lg bg-primary text-primary-foreground items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Sparkles className="w-4 h-4" />
            </div>
            Questify
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">{t('nav.howItWorks')}</Link>
            <Link href="#features" className="hover:text-white transition-colors">{t('nav.features')}</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">{t('nav.pricing')}</Link>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">
              {t('nav.logIn')}
            </Link>
            <Link href="/sign-up">
              <Button className="rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-semibold px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                {t('nav.startForFree')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mt-16">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-medium">{t('hero.live')}</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] text-white flex flex-col items-center justify-center">
              <span>{t('title')}</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              {t('description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full px-8 h-14 text-base font-bold bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:opacity-90 shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] transition-all border-0">
                  {t('hero.createFree')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base font-semibold border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all">
                  <PlayCircle className="w-5 h-5 mr-2 opacity-70" />
                  {t('hero.howItWorks')}
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('hero.noCreditCard')}
              <span className="mx-2">•</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('hero.cancelAnytime')}
            </div>
          </div>
        </section>

        {/* Social Proof Strip */}
        <section className="py-10 border-y border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-6">{t('social.trustedBy')}</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              {['Acme Corp', 'Global Edu', 'TechFlow', 'Learnix', 'MarketPro'].map((company) => (
                <div key={company} className="text-xl font-black tracking-tighter text-zinc-400 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-600"></div>
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">{t('howItWorks.title')}</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">{t('howItWorks.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>
              
              {[
                {
                  step: "01",
                  icon: BrainCircuit,
                  title: t('howItWorks.step1.title'),
                  desc: t('howItWorks.step1.desc')
                },
                {
                  step: "02",
                  icon: Sparkles,
                  title: t('howItWorks.step2.title'),
                  desc: t('howItWorks.step2.desc')
                },
                {
                  step: "03",
                  icon: Share2,
                  title: t('howItWorks.step3.title'),
                  desc: t('howItWorks.step3.desc')
                }
              ].map((item) => (
                <div key={item.step} className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:bg-white/10 transition-colors group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="absolute top-8 right-8 text-6xl font-black text-white/5 pointer-events-none select-none">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-24 bg-black/50 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">{t('features.title')}</h2>
              <p className="text-zinc-400 max-w-2xl text-lg">{t('features.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
              {/* Large Feature */}
              <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{t('features.feat1.title')}</h3>
                  <p className="text-zinc-400 text-lg max-w-md">{t('features.feat1.desc')}</p>
                </div>
                {/* Mockup visual placeholder */}
                <div className="mt-8 h-48 rounded-xl bg-black/50 border border-white/10 overflow-hidden relative shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                  <div className="w-full h-full p-4 flex gap-4 opacity-50">
                     <div className="w-1/3 h-full bg-indigo-500/20 rounded-lg"></div>
                     <div className="w-2/3 flex flex-col gap-4">
                       <div className="h-8 w-3/4 bg-white/10 rounded-md"></div>
                       <div className="h-24 w-full bg-white/5 rounded-md"></div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Small Feature 1 */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <GraduationCap className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('features.feat2.title')}</h3>
                <p className="text-zinc-400">{t('features.feat2.desc')}</p>
              </div>

              {/* Small Feature 2 */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('features.feat3.title')}</h3>
                <p className="text-zinc-400">{t('features.feat3.desc')}</p>
              </div>

              {/* Wide Feature */}
              <div className="md:col-span-3 bg-gradient-to-r from-zinc-900 to-black border border-white/10 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
                <div className="relative z-10 md:w-1/2 mb-8 md:mb-0">
                  <h3 className="text-3xl font-bold text-white mb-4">{t('features.feat4.title')}</h3>
                  <p className="text-zinc-400 text-lg">{t('features.feat4.desc')}</p>
                </div>
                <div className="relative z-10 flex gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-xl"><MousePointerClick className="text-white w-8 h-8"/></div>
                   <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-xl"><Users className="text-white w-8 h-8"/></div>
                   <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-xl"><Zap className="text-white w-8 h-8"/></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 relative">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-900/50 via-black to-blue-900/50 rounded-[3rem] p-12 md:p-20 text-center border border-indigo-500/30 relative overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">{t('cta.title')}</h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all">
                  {t('cta.button')}
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-zinc-500">{t('cta.footer')}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-lg">
            <div className="flex w-6 h-6 rounded bg-primary text-primary-foreground items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </div>
            Questify
          </div>
          <p className="text-zinc-500 text-sm">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex gap-4 text-sm text-zinc-500" aria-label={t('footer.information')}>
            <span>{t('footer.terms')}</span>
            <span>{t('footer.privacy')}</span>
            <span>{t('footer.contact')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
