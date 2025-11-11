import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, LogOut } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  image_url: string | null;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
}

interface SiteSettings {
  id: string;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  bio: string | null;
  location: string | null;
  availability: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string | null;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  order_index: number;
}

const Admin = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  
  // Project states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    long_description: "",
    image_url: "",
    tech_stack: "",
    live_url: "",
    github_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Site settings states
  const [settingsFormData, setSettingsFormData] = useState<SiteSettings>({
    id: "",
    hero_image_url: "",
    hero_title: "",
    hero_subtitle: "",
    bio: "",
    location: "",
    availability: "",
    github_url: "",
    linkedin_url: "",
    twitter_url: "",
    email: "",
  });
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

  // Skill states
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillFormData, setSkillFormData] = useState({
    name: "",
    category: "",
    proficiency: 80,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchAllData();
  };

  const fetchAllData = async () => {
    await Promise.all([fetchProjects(), fetchSiteSettings(), fetchSkills()]);
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("site_settings")
        .select("*")
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSiteSettings(data as any);
        setSettingsFormData(data as any);
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load site settings", variant: "destructive" });
    }
  };

  const fetchSkills = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("skills")
        .select("*")
        .order("category", { ascending: true })
        .order("order_index", { ascending: true });
      if (error) throw error;
      setSkills((data || []) as any);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load skills", variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Project handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'project' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'project') setUploadingImage(true);
      else setUploadingHeroImage(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${type === 'project' ? 'projects' : 'hero'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      if (type === 'project') {
        setProjectFormData({ ...projectFormData, image_url: publicUrl });
      } else {
        setSettingsFormData({ ...settingsFormData, hero_image_url: publicUrl });
      }
      
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to upload image", variant: "destructive" });
    } finally {
      if (type === 'project') setUploadingImage(false);
      else setUploadingHeroImage(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      title: projectFormData.title,
      description: projectFormData.description,
      long_description: projectFormData.long_description || null,
      image_url: projectFormData.image_url || null,
      tech_stack: projectFormData.tech_stack.split(",").map(s => s.trim()).filter(Boolean),
      live_url: projectFormData.live_url || null,
      github_url: projectFormData.github_url || null,
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProject.id);
        if (error) throw error;
        toast({ title: "Success", description: "Project updated successfully" });
      } else {
        const { error } = await supabase.from("projects").insert([projectData]);
        if (error) throw error;
        toast({ title: "Success", description: "Project created successfully" });
      }

      setProjectDialogOpen(false);
      setEditingProject(null);
      setProjectFormData({
        title: "",
        description: "",
        long_description: "",
        image_url: "",
        tech_stack: "",
        live_url: "",
        github_url: "",
      });
      fetchProjects();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save project", variant: "destructive" });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      title: project.title,
      description: project.description,
      long_description: project.long_description || "",
      image_url: project.image_url || "",
      tech_stack: project.tech_stack.join(", "),
      live_url: project.live_url || "",
      github_url: project.github_url || "",
    });
    setProjectDialogOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Project deleted successfully" });
      fetchProjects();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    }
  };

  // Site settings handlers
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (siteSettings?.id) {
        const { error } = await (supabase as any)
          .from("site_settings")
          .update({
            hero_image_url: settingsFormData.hero_image_url || null,
            hero_title: settingsFormData.hero_title || null,
            hero_subtitle: settingsFormData.hero_subtitle || null,
            bio: settingsFormData.bio || null,
            location: settingsFormData.location || null,
            availability: settingsFormData.availability || null,
            github_url: settingsFormData.github_url || null,
            linkedin_url: settingsFormData.linkedin_url || null,
            twitter_url: settingsFormData.twitter_url || null,
            email: settingsFormData.email || null,
          } as any)
          .eq("id", siteSettings.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("site_settings").insert([{
          hero_image_url: settingsFormData.hero_image_url || null,
          hero_title: settingsFormData.hero_title || null,
          hero_subtitle: settingsFormData.hero_subtitle || null,
          bio: settingsFormData.bio || null,
          location: settingsFormData.location || null,
          availability: settingsFormData.availability || null,
          github_url: settingsFormData.github_url || null,
          linkedin_url: settingsFormData.linkedin_url || null,
          twitter_url: settingsFormData.twitter_url || null,
          email: settingsFormData.email || null,
        } as any]);
        if (error) throw error;
      }
      
      toast({ title: "Success", description: "Site settings updated successfully" });
      fetchSiteSettings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save settings", variant: "destructive" });
    }
  };

  // Skill handlers
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSkill) {
        const { error } = await (supabase as any)
          .from("skills")
          .update({
            name: skillFormData.name,
            category: skillFormData.category,
            proficiency: skillFormData.proficiency,
          } as any)
          .eq("id", editingSkill.id);
        if (error) throw error;
        toast({ title: "Success", description: "Skill updated successfully" });
      } else {
        const { error } = await (supabase as any).from("skills").insert([{
          name: skillFormData.name,
          category: skillFormData.category,
          proficiency: skillFormData.proficiency,
        } as any]);
        if (error) throw error;
        toast({ title: "Success", description: "Skill created successfully" });
      }

      setSkillDialogOpen(false);
      setEditingSkill(null);
      setSkillFormData({ name: "", category: "", proficiency: 80 });
      fetchSkills();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save skill", variant: "destructive" });
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
    });
    setSkillDialogOpen(true);
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const { error } = await (supabase as any).from("skills").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Skill deleted successfully" });
      fetchSkills();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete skill", variant: "destructive" });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2 animate-fade-in">
                  Admin <span className="text-accent">Dashboard</span>
                </h1>
                <p className="text-muted-foreground">Manage your portfolio content</p>
              </div>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="mr-2" size={16} />
                Sign Out
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="settings">Site Settings</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-6">
                  <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90">
                        <Plus className="mr-2" size={16} />
                        Add Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
                        <DialogDescription>Fill in the project details below</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleProjectSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={projectFormData.title}
                            onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Short Description *</Label>
                          <Textarea
                            id="description"
                            value={projectFormData.description}
                            onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="long_description">Long Description</Label>
                          <Textarea
                            id="long_description"
                            rows={4}
                            value={projectFormData.long_description}
                            onChange={(e) => setProjectFormData({ ...projectFormData, long_description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image_url">Project Image</Label>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Input
                                id="image_upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'project')}
                                disabled={uploadingImage}
                                className="flex-1"
                              />
                              {uploadingImage && (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent"></div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground text-center">or</div>
                            <Input
                              id="image_url"
                              type="url"
                              placeholder="Enter image URL"
                              value={projectFormData.image_url}
                              onChange={(e) => setProjectFormData({ ...projectFormData, image_url: e.target.value })}
                            />
                            {projectFormData.image_url && (
                              <img 
                                src={projectFormData.image_url} 
                                alt="Preview" 
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tech_stack">Tech Stack (comma-separated) *</Label>
                          <Input
                            id="tech_stack"
                            placeholder="React, TypeScript, Tailwind CSS"
                            value={projectFormData.tech_stack}
                            onChange={(e) => setProjectFormData({ ...projectFormData, tech_stack: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="live_url">Live URL</Label>
                          <Input
                            id="live_url"
                            type="url"
                            value={projectFormData.live_url}
                            onChange={(e) => setProjectFormData({ ...projectFormData, live_url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github_url">GitHub URL</Label>
                          <Input
                            id="github_url"
                            type="url"
                            value={projectFormData.github_url}
                            onChange={(e) => setProjectFormData({ ...projectFormData, github_url: e.target.value })}
                          />
                        </div>
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                          {editingProject ? "Update Project" : "Create Project"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <Card key={project.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{project.title}</CardTitle>
                              <CardDescription>{project.description}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditProject(project)}>
                                <Edit size={16} />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            <p><strong>Tech:</strong> {project.tech_stack.join(", ")}</p>
                            {project.live_url && <p><strong>Live:</strong> {project.live_url}</p>}
                            {project.github_url && <p><strong>GitHub:</strong> {project.github_url}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Site Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Site Settings</CardTitle>
                      <CardDescription>Update your hero section, bio, and contact information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSettingsSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="hero_image">Hero Image</Label>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'hero')}
                                disabled={uploadingHeroImage}
                                className="flex-1"
                              />
                              {uploadingHeroImage && (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent"></div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground text-center">or</div>
                            <Input
                              type="url"
                              placeholder="Enter image URL"
                              value={settingsFormData.hero_image_url || ""}
                              onChange={(e) => setSettingsFormData({ ...settingsFormData, hero_image_url: e.target.value })}
                            />
                            {settingsFormData.hero_image_url && (
                              <img 
                                src={settingsFormData.hero_image_url} 
                                alt="Hero Preview" 
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="hero_title">Hero Title</Label>
                            <Input
                              id="hero_title"
                              value={settingsFormData.hero_title || ""}
                              onChange={(e) => setSettingsFormData({ ...settingsFormData, hero_title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                            <Input
                              id="hero_subtitle"
                              value={settingsFormData.hero_subtitle || ""}
                              onChange={(e) => setSettingsFormData({ ...settingsFormData, hero_subtitle: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            rows={4}
                            value={settingsFormData.bio || ""}
                            onChange={(e) => setSettingsFormData({ ...settingsFormData, bio: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={settingsFormData.location || ""}
                              onChange={(e) => setSettingsFormData({ ...settingsFormData, location: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="availability">Availability</Label>
                            <Input
                              id="availability"
                              value={settingsFormData.availability || ""}
                              onChange={(e) => setSettingsFormData({ ...settingsFormData, availability: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={settingsFormData.email || ""}
                            onChange={(e) => setSettingsFormData({ ...settingsFormData, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Social Links</Label>
                          <div className="space-y-3">
                            <Input
                              placeholder="GitHub URL"
                              type="url"
                              value={settingsFormData.github_url || ""}
                              onChange={(e) => setSettingsFormData({ ...settingsFormData, github_url: e.target.value })}
                            />
                            <Input
                              placeholder="LinkedIn URL"
                              type="url"
                              value={settingsFormData.linkedin_url || ""}
                              onChange={(e) => setSettingsFormData({ ...settingsFormData, linkedin_url: e.target.value })}
                            />
                            <Input
                              placeholder="Twitter URL"
                              type="url"
                              value={settingsFormData.twitter_url || ""}
                              onChange={(e) => setSettingsFormData({ ...settingsFormData, twitter_url: e.target.value })}
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                          Save Settings
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-6">
                  <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90">
                        <Plus className="mr-2" size={16} />
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
                        <DialogDescription>Fill in the skill details below</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSkillSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="skill_name">Skill Name *</Label>
                          <Input
                            id="skill_name"
                            value={skillFormData.name}
                            onChange={(e) => setSkillFormData({ ...skillFormData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Input
                            id="category"
                            placeholder="e.g., Languages, Frameworks, Tools"
                            value={skillFormData.category}
                            onChange={(e) => setSkillFormData({ ...skillFormData, category: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proficiency">Proficiency (0-100) *</Label>
                          <Input
                            id="proficiency"
                            type="number"
                            min="0"
                            max="100"
                            value={skillFormData.proficiency}
                            onChange={(e) => setSkillFormData({ ...skillFormData, proficiency: parseInt(e.target.value) })}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                          {editingSkill ? "Update Skill" : "Create Skill"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="grid gap-4">
                    {Object.entries(
                      skills.reduce((acc, skill) => {
                        const category = skill.category;
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(skill);
                        return acc;
                      }, {} as Record<string, Skill[]>)
                    ).map(([category, categorySkills]) => (
                      <Card key={category}>
                        <CardHeader>
                          <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {categorySkills.map((skill) => (
                              <div key={skill.id} className="flex justify-between items-center p-2 border rounded">
                                <div>
                                  <p className="font-medium">{skill.name}</p>
                                  <p className="text-sm text-muted-foreground">Proficiency: {skill.proficiency}%</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEditSkill(skill)}>
                                    <Edit size={16} />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteSkill(skill.id)}>
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;