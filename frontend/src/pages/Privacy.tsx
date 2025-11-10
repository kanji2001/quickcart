import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, Globe, UserCog } from 'lucide-react';

const sections = [
  {
    title: 'Information We Collect',
    description:
      'We collect details you provide (like account info, orders, and reviews) plus usage data from cookies and analytics to keep QuickCart running smoothly.',
    icon: ShieldCheck,
  },
  {
    title: 'How We Use Your Data',
    description:
      'Your data helps us deliver orders, personalize recommendations, improve QuickCart features, and prevent fraud or abuse across the platform.',
    icon: UserCog,
  },
  {
    title: 'Sharing & Disclosure',
    description:
      'We do not sell your personal data. Limited information is shared with trusted partners for payments, shipping, analytics, or legal compliance.',
    icon: Globe,
  },
  {
    title: 'Your Choices & Rights',
    description:
      'Update or delete your data anytime from your account settings or by contacting us. Depending on your region, additional data rights may apply.',
    icon: Lock,
  },
];

export default function Privacy() {
  return (
    <div className="bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-16 space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-4"
        >
          <Badge variant="secondary" className="px-3 py-1">
            We protect your data
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            We design QuickCart with privacy in mind. This policy explains what data we collect, how we protect it, and the control you have
            over your information.
          </p>
        </motion.section>

        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="h-full border border-muted/60">
                <CardHeader className="space-y-3">
                  <div className="inline-flex rounded-full bg-primary/10 p-3 text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-7 text-muted-foreground">{section.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="max-w-4xl mx-auto border border-dashed border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle>Want to manage your data?</CardTitle>
            <CardDescription>
              Reach us at <span className="text-primary font-medium">privacy@quickcart.com</span> and we&apos;ll respond within 24 hours.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

