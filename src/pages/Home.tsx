import { Github, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-image.jpg";
import profileImage from "@/assets/profile-placeholder.jpg";

interface SiteSettings {
  hero_image_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  bio?: string;
  email?: string;
  location?: string;
  availability?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
}

const Home = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings' as any)
          .select('*')
          .maybeSingle();

        if (error) {
          console.error('Error fetching site settings:', error);
        } else {
          setSettings(data as SiteSettings);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const socialLinks = [
    { 
      icon: Github, 
      url: settings?.github_url || "https://github.com", 
      label: "GitHub" 
    },
    { 
      icon: Linkedin, 
      url: settings?.linkedin_url || "https://linkedin.com", 
      label: "LinkedIn" 
    },
    { 
      icon: Twitter, 
      url: settings?.twitter_url || "https://twitter.com", 
      label: "Twitter" 
    },
  ].filter(link => link.url && link.url !== "");

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle -z-10" />
        <div 
          className="absolute inset-0 opacity-5 -z-10"
          style={{
            backgroundImage: `url(${settings?.hero_image_url || heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Profile Image with Subtle Shadow */}
            <div className="mb-8 animate-fade-in">
              <img
                src={settings?.hero_image_url || profileImage}
                alt="Goodness Williams"
                className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto border-4 border-accent/30 shadow-lg object-cover"
              />
            </div>
            
            {/* Main Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-up text-foreground leading-tight">
              {loading ? "Loading..." : (settings?.hero_title || "Hi, I'm Goodness Williams")}
            </h1>
            
            {/* Subtitle/Role */}
            <p className="text-lg md:text-xl text-muted-foreground mb-6 animate-fade-in-up">
              {settings?.hero_subtitle || "Full Stack Developer & Creative Problem Solver"}
            </p>
            
            {/* Bio */}
            {settings?.bio && (
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up leading-relaxed">
                {settings.bio}
              </p>
            )}

            {/* Contact Info Pills */}
            {(settings?.location || settings?.availability || settings?.email) && (
              <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in-up">
                {settings?.location && (
                  <span className="px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 text-sm font-medium flex items-center gap-2 hover:border-accent/50 transition-colors">
                    <span className="text-accent">📍</span> {settings.location}
                  </span>
                )}
                {settings?.availability && (
                  <span className="px-4 py-2 rounded-full bg-accent/10 backdrop-blur-sm border border-accent/30 text-sm font-medium flex items-center gap-2 text-accent">
                    <span>✓</span> {settings.availability}
                  </span>
                )}
                {settings?.email && (
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 text-sm font-medium flex items-center gap-2 hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    <span className="text-accent">✉</span> {settings.email}
                  </a>
                )}
              </div>
            )}

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-10 animate-fade-in-up">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full border border-border hover:border-accent hover:bg-accent/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={24} />
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Button 
                asChild 
                size="lg"
                className="bg-accent hover:bg-accent/90 shadow-accent"
              >
                <Link to="/projects">
                  View My Work <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-accent text-accent hover:bg-accent/10"
              >
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: "Years Experience", value: "5+" },
              { label: "Projects Completed", value: "50+" },
              { label: "Happy Clients", value: "30+" },
              { label: "Code Commits", value: "1000+" },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
