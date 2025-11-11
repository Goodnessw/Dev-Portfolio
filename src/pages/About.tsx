import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, Palette, Rocket, Users } from "lucide-react";

const About = () => {
  const skills = [
    {
      category: "Frontend",
      items: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vue.js"],
    },
    {
      category: "Backend",
      items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST APIs"],
    },
    {
      category: "Tools",
      items: ["Git", "Docker", "AWS", "Vercel", "Supabase"],
    },
    {
      category: "Other",
      items: ["UI/UX Design", "Agile", "CI/CD", "Testing", "Performance"],
    },
  ];

  const values = [
    {
      icon: Code2,
      title: "Clean Code",
      description: "Writing maintainable, scalable code that stands the test of time.",
    },
    {
      icon: Palette,
      title: "Design First",
      description: "Crafting beautiful, intuitive interfaces that users love.",
    },
    {
      icon: Rocket,
      title: "Fast Delivery",
      description: "Shipping quality products quickly without compromising standards.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Working closely with teams to achieve outstanding results.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              About <span className="text-accent">Me</span>
            </h1>
            
            <div className="prose prose-lg max-w-none mb-16 animate-fade-in-up">
              <p className="text-muted-foreground text-lg leading-relaxed">
                I'm a passionate full-stack developer with over 5 years of experience 
                building web applications that make a difference. I specialize in creating 
                fast, responsive, and user-friendly solutions using modern technologies.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                My journey in tech started with a curiosity for how things work and evolved 
                into a career dedicated to solving complex problems with elegant code. 
                I believe in continuous learning and staying up-to-date with the latest 
                industry trends.
              </p>
            </div>

            {/* Values */}
            <h2 className="text-3xl font-bold mb-8 animate-fade-in-up">
              What I Value
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {values.map((value, index) => (
                <Card 
                  key={index}
                  className="border-border hover:border-accent transition-colors duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <value.icon className="w-10 h-10 text-accent mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Skills */}
            <h2 className="text-3xl font-bold mb-8 animate-fade-in-up">
              Skills & Technologies
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {skills.map((skillGroup, index) => (
                <div 
                  key={index}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-accent">
                    {skillGroup.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-secondary rounded-full text-sm font-medium hover:bg-accent/10 hover:text-accent transition-colors duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
