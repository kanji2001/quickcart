import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useContactMutation } from '@/hooks/support/use-contact';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  subject: z.string().trim().min(4, 'Subject must be at least 4 characters'),
  message: z.string().trim().min(20, 'Message must be at least 20 characters'),
  orderId: z
    .string()
    .trim()
    .max(64, 'Order ID must be 64 characters or less')
    .optional()
    .refine((value) => !value || value.length === 0 || value.length >= 6, {
      message: 'Order ID must be at least 6 characters',
    }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const supportHighlights = [
  {
    title: 'Always-On Support',
    description: 'Dedicated specialists available to help across time zones.',
    icon: Clock,
  },
  {
    title: 'Order Assistance',
    description: 'Get help with tracking, returns, and inventory questions.',
    icon: PackageSearch,
  },
  {
    title: 'Secure Shopping',
    description: 'We protect every interaction with enterprise-grade security.',
    icon: ShieldCheck,
  },
];

export default function Contact() {
  const contactMutation = useContactMutation();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      orderId: '',
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    const payload = {
      ...values,
      orderId: values.orderId ? values.orderId : undefined,
    };

    contactMutation.mutate(payload, {
      onSuccess: (response) => {
        toast.success('Message sent', {
          description: response.message ?? 'Our support team will reply shortly.',
        });
        form.reset();
      },
      onError: () => {
        toast.error('Unable to send message', {
          description: 'Please try again or email support@quickcart.com.',
        });
      },
    });
  };

  return (
    <div className="bg-gradient-to-b from-primary/5 via-transparent to-transparent">
      <div className="container mx-auto px-4 py-16 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-4"
        >
          <Badge variant="secondary" className="px-3 py-1 text-primary-foreground bg-primary/15">
            We reply within 12 hours
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Let&apos;s talk about your experience</h1>
          <p className="text-muted-foreground text-lg">
            Whether you have a question about an order, need help choosing a product, or want to partner with QuickCart,
            our team is ready to jump in.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <Card className="border-none shadow-xl shadow-primary/10">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <CardDescription>Fill out the form and our support team will follow up by email.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order ID (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. QC-123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Share the details so we can assist you faster..." rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={contactMutation.isPending}>
                      {contactMutation.isPending ? 'Sending...' : 'Send message'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="border-none bg-gradient-to-br from-primary/90 via-primary to-primary/60 text-primary-foreground shadow-xl">
              <CardContent className="space-y-6 py-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/70">Email</p>
                    <p className="font-medium">support@quickcart.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/70">Phone</p>
                    <p className="font-medium">+1 (555) 012-3456</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/70">Location</p>
                    <p className="font-medium leading-6">
                      QuickCart Inc.
                      <br />
                      123 Commerce Street
                      <br />
                      Innovation City, CA 94016
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/70">Partnerships & Press</p>
                    <p className="font-medium">partnerships@quickcart.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support hours</CardTitle>
                <CardDescription>We answer every message within the same business day.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium text-foreground">9:00 AM - 6:00 PM UTC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-foreground">10:00 AM - 4:00 PM UTC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-foreground">Closed</span>
                </div>
              </CardContent>
            </Card>
          </motion.aside>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {supportHighlights.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card className="h-full border border-muted/60">
                <CardContent className="space-y-4 p-6">
                  <div className="inline-flex rounded-full bg-primary/10 p-3 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-6">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

