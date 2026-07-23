import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Container } from "../../components/Container";
import { AdminHeader, type AdminTab } from "../../components/admin/AdminHeader";
import { PostsPanel } from "../../components/admin/PostsPanel";
import { PostEditor } from "../../components/admin/PostEditor";
import { CategoriesPanel } from "../../components/admin/CategoriesPanel";
import { ServicesPanel } from "../../components/admin/ServicesPanel";
import { ProjectsPanel } from "../../components/admin/ProjectsPanel";
import { HomeSettingsPanel } from "../../components/admin/HomeSettingsPanel";
import { AboutSettingsPanel } from "../../components/admin/AboutSettingsPanel";
import { SiteSettingsPanel } from "../../components/admin/SiteSettingsPanel";
import { AccountSettingsPanel } from "../../components/admin/AccountSettingsPanel";
import { UsersPanel } from "../../components/admin/UsersPanel";
import { ActivityLogsPanel } from "../../components/admin/ActivityLogsPanel";
import { useAdminBlogPosts } from "../../hooks/useAdminBlogPosts";
import { useBlogCategories } from "../../hooks/useBlogCategories";
import { useIdleTimeout } from "../../lib/useIdleTimeout";
import type { BlogPost } from "../../types";

type View = { mode: "list" } | { mode: "editor"; post: BlogPost | null };

export default function Dashboard() {
  useIdleTimeout(20);

  const [tab, setTab] = useState<AdminTab>("posts");
  const [view, setView] = useState<View>({ mode: "list" });

  const { posts, loading: postsLoading, refresh: refreshPosts } = useAdminBlogPosts();
  const { categories, loading: categoriesLoading, refresh: refreshCategories } = useBlogCategories();

  return (
    <div className="min-h-screen bg-concrete-50">
      <Helmet>
        <title>Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminHeader
        tab={tab}
        onTabChange={(t) => {
          setTab(t);
          setView({ mode: "list" });
        }}
      />

      <Container className="py-10">
        {view.mode === "editor" ? (
          <PostEditor
            post={view.post}
            categories={categories}
            onCancel={() => setView({ mode: "list" })}
            onSaved={() => {
              refreshPosts();
              setView({ mode: "list" });
            }}
          />
        ) : tab === "posts" ? (
          <PostsPanel
            posts={posts}
            loading={postsLoading}
            onCreate={() => setView({ mode: "editor", post: null })}
            onEdit={(post) => setView({ mode: "editor", post })}
            onDeleted={refreshPosts}
          />
        ) : tab === "categories" ? (
          <CategoriesPanel categories={categories} loading={categoriesLoading} onRefresh={refreshCategories} />
        ) : tab === "services" ? (
          <ServicesPanel />
        ) : tab === "projects" ? (
          <ProjectsPanel />
        ) : tab === "home" ? (
          <HomeSettingsPanel />
        ) : tab === "about" ? (
          <AboutSettingsPanel />
        ) : tab === "settings" ? (
          <SiteSettingsPanel />
        ) : tab === "users" ? (
          <UsersPanel />
        ) : tab === "security" ? (
          <ActivityLogsPanel />
        ) : (
          <AccountSettingsPanel />
        )}
      </Container>
    </div>
  );
}
