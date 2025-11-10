import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Leaf, Globe, Truck, Users, Heart } from 'lucide-react';

const stats = [
  { label: 'Products curated', value: '50k+' },
  { label: 'Happy customers', value: '2M+' },
  { label: 'Global sellers', value: '8k+' },
];

const values = [
  {
    title: 'Curated quality',
    description: 'Every product is screened by our merchandising team to meet quality and sustainability standards.',
    icon: Sparkles,
  },
  {
    title: 'Planet positive',
    description: 'We offset deliveries and support climate initiatives in every region we operate.',
    icon: Leaf,
  },
  {
    title: 'Communities first',
    description: 'QuickCart reinvests 1% of revenue into local seller accelerators and customer education.',
    icon: Heart,
  },
];

const milestones = [
  { year: '2019', detail: 'QuickCart launches with 200 hand-picked brands and a promise of next-day delivery.' },
  { year: '2021', detail: 'Expanded to 12 countries with localized fulfilment and 95% customer satisfaction.' },
  { year: '2024', detail: 'Introduced carbon-conscious logistics and community micro-warehouses for faster, greener shipping.' },
];

export default function About() {
  return (
    <div className="bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-16 space-y-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-4"
        >
          <Badge variant="secondary" className="px-3 py-1">
            Built for modern commerce
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">About QuickCart</h1>
          <p className="text-muted-foreground text-lg">
            QuickCart reimagines online shopping with curated collections, trusted sellers, and deliveries that feel effortless.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 rounded-3xl border bg-card p-8 shadow-lg shadow-primary/5 md:grid-cols-3"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </motion.section>

        <section className="grid gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold">Our mission</h2>
            <p className="text-muted-foreground leading-7">
              We started QuickCart to remove friction from online shopping. With a focus on quality and service, we partner with celebrated
              brands and emerging creators to deliver trusted products at remarkable value.
            </p>
            <p className="text-muted-foreground leading-7">
              Behind the scenes, our logistics network orchestrates fast, reliable shipping with a human touch. We believe the future of
              commerce is curated, ethical, and community-driven.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {values.map((value) => (
              <Card key={value.title} className="border border-muted/60">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <value.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-6">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="border border-muted/60">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">The QuickCart journey</CardTitle>
                <CardDescription>Every milestone reflects our commitment to meaningful commerce.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {milestones.map((milestone) => (
                  <div key={milestone.year} className="relative pl-6">
                    <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-sm font-semibold text-primary">{milestone.year}</p>
                    <p className="text-muted-foreground leading-6">{milestone.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="border-none bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground">
              <CardContent className="space-y-6 p-8">
                <Users className="h-10 w-10" />
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">People-first culture</h3>
                  <p className="text-sm text-white/80 leading-6">
                    Our teams span 9 time zones and share a single mission: crafting joyful shopping experiences. We empower every employee
                    to experiment, learn, and build with empathy.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-white/80">
                  <p>- Remote-friendly since day one</p>
                  <p>- Inclusive leadership programs</p>
                  <p>- Volunteer days in every city we serve</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-muted/60">
              <CardContent className="flex items-start gap-3 p-6">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold">Powered by responsible logistics</h4>
                  <CardDescription className="text-sm leading-6">
                    We partner with carbon-neutral carriers and ship from local hubs to reduce delivery miles and keep emissions in check.
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <Card className="max-w-4xl mx-auto border border-dashed border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle>Let&apos;s build the future of retail together</CardTitle>
            <CardDescription>
              Interested in partnering with QuickCart? Email{' '}
              <span className="text-primary font-medium">partners@quickcart.com</span> and our team will reach out within two business days.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}


