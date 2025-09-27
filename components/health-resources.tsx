"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Brain,
  Activity,
  Apple,
  Shield,
  Baby,
  Users,
  Search,
  BookOpen,
  Video,
  Download,
  Clock,
  Eye,
} from "lucide-react"

export function HealthResources() {
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { id: "heart", name: "Heart Health", icon: Heart, color: "text-red-500" },
    { id: "mental", name: "Mental Health", icon: Brain, color: "text-purple-500" },
    { id: "fitness", name: "Fitness & Exercise", icon: Activity, color: "text-green-500" },
    { id: "nutrition", name: "Nutrition", icon: Apple, color: "text-orange-500" },
    { id: "prevention", name: "Preventive Care", icon: Shield, color: "text-blue-500" },
    { id: "pediatric", name: "Pediatric Health", icon: Baby, color: "text-pink-500" },
    { id: "senior", name: "Senior Health", icon: Users, color: "text-indigo-500" },
  ]

  const featuredArticles = [
    {
      id: 1,
      title: "Understanding Heart Disease Prevention",
      category: "Heart Health",
      description:
        "Learn about the key factors that contribute to heart disease and how to prevent them through lifestyle changes.",
      readTime: "8 min read",
      image: "/heart-health-prevention.jpg",
      type: "article",
      featured: true,
    },
    {
      id: 2,
      title: "Mental Health Awareness: Breaking the Stigma",
      category: "Mental Health",
      description: "Explore the importance of mental health awareness and resources available for support.",
      readTime: "6 min read",
      image: "/mental-health-awareness.jpg",
      type: "article",
      featured: true,
    },
    {
      id: 3,
      title: "Nutrition Guidelines for a Healthy Life",
      category: "Nutrition",
      description: "Comprehensive guide to balanced nutrition and healthy eating habits for all ages.",
      readTime: "10 min read",
      image: "/nutrition-guidelines.jpg",
      type: "article",
      featured: true,
    },
  ]

  const allResources = [
    {
      id: 4,
      title: "Exercise for Beginners: Getting Started",
      category: "Fitness & Exercise",
      description: "A beginner's guide to starting an exercise routine safely and effectively.",
      readTime: "5 min read",
      type: "article",
      date: "March 10, 2024",
    },
    {
      id: 5,
      title: "Diabetes Management Workshop",
      category: "Preventive Care",
      description: "Interactive workshop on managing diabetes through diet, exercise, and medication.",
      readTime: "45 min",
      type: "video",
      date: "March 8, 2024",
    },
    {
      id: 6,
      title: "Child Development Milestones",
      category: "Pediatric Health",
      description: "Understanding important developmental milestones in children from birth to age 5.",
      readTime: "7 min read",
      type: "guide",
      date: "March 5, 2024",
    },
    {
      id: 7,
      title: "Healthy Aging: Staying Active After 65",
      category: "Senior Health",
      description: "Tips and strategies for maintaining physical and mental health in your golden years.",
      readTime: "6 min read",
      type: "article",
      date: "March 3, 2024",
    },
    {
      id: 8,
      title: "Stress Management Techniques",
      category: "Mental Health",
      description: "Practical techniques for managing stress and improving mental well-being.",
      readTime: "8 min read",
      type: "article",
      date: "March 1, 2024",
    },
    {
      id: 9,
      title: "Heart-Healthy Recipe Collection",
      category: "Heart Health",
      description: "Delicious and nutritious recipes designed to support cardiovascular health.",
      readTime: "Download",
      type: "download",
      date: "February 28, 2024",
    },
    {
      id: 10,
      title: "Vaccination Schedule for Adults",
      category: "Preventive Care",
      description: "Complete guide to recommended vaccinations for adults by age group.",
      readTime: "4 min read",
      type: "guide",
      date: "February 25, 2024",
    },
    {
      id: 11,
      title: "Sleep Hygiene for Better Health",
      category: "Mental Health",
      description: "Learn how proper sleep habits can improve your overall health and well-being.",
      readTime: "6 min read",
      type: "article",
      date: "February 22, 2024",
    },
  ]

  const healthTips = [
    {
      tip: "Drink at least 8 glasses of water daily to stay properly hydrated.",
      category: "Nutrition",
    },
    {
      tip: "Aim for 150 minutes of moderate exercise per week for optimal health.",
      category: "Fitness",
    },
    {
      tip: "Get 7-9 hours of quality sleep each night to support your immune system.",
      category: "Wellness",
    },
    {
      tip: "Practice deep breathing exercises to reduce stress and anxiety.",
      category: "Mental Health",
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "download":
        return <Download className="w-4 h-4" />
      case "guide":
        return <BookOpen className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-700"
      case "download":
        return "bg-green-100 text-green-700"
      case "guide":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredResources = allResources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search health topics, articles, and resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 text-center">
              <category.icon className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
              <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Articles */}
      {!searchQuery && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="group hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{resource.category}</Badge>
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeColor(resource.type)}`}
                    >
                      {getTypeIcon(resource.type)}
                      <span className="capitalize">{resource.type}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {resource.readTime}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{resource.date}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="articles">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources
              .filter((resource) => resource.type === "article")
              .map((resource) => (
                <Card key={resource.id} className="group hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{resource.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {resource.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                      Read Article →
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources
              .filter((resource) => resource.type === "video")
              .map((resource) => (
                <Card key={resource.id} className="group hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{resource.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Video className="w-3 h-3 mr-1" />
                        {resource.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                      Watch Video →
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="guides">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources
              .filter((resource) => resource.type === "guide")
              .map((resource) => (
                <Card key={resource.id} className="group hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{resource.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {resource.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                      View Guide →
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="downloads">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources
              .filter((resource) => resource.type === "download")
              .map((resource) => (
                <Card key={resource.id} className="group hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{resource.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Health Tips Sidebar */}
      <section className="bg-accent/30 rounded-lg p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Daily Health Tips</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {healthTips.map((tip, index) => (
            <div key={index} className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{tip.tip}</p>
                  <Badge variant="outline" className="text-xs">
                    {tip.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="text-center bg-primary/5 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-foreground mb-4">Stay Informed</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Subscribe to our health newsletter for the latest medical insights, wellness tips, and health updates
          delivered to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input placeholder="Enter your email address" className="flex-1" />
          <Button>Subscribe</Button>
        </div>
      </section>
    </div>
  )
}
