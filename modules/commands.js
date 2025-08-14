// Blog TUI Manager - handles blog TUI state and operations
class BlogManager {
  constructor() {
    this.blogsIndex = null;
    this.blogsCache = new Map();
    this.currentState = 'list'; // 'list', 'reading', 'search', 'filtered'
    this.currentBlog = null;
    this.currentFilter = null;
    this.searchResults = null;
    this.selectedTags = new Set(); // Track selected tags for filtering
  }

  async loadBlogsIndex() {
    if (this.blogsIndex) return this.blogsIndex;
    
    try {
      const response = await fetch('./blogs/index.json');
      this.blogsIndex = await response.json();
      return this.blogsIndex;
    } catch (error) {
      console.error('Failed to load blogs index:', error);
      return { blogs: [] };
    }
  }

  async loadBlogContent(filename) {
    if (this.blogsCache.has(filename)) {
      return this.blogsCache.get(filename);
    }

    try {
      const response = await fetch(`./blogs/${filename}`);
      const content = await response.text();
      this.blogsCache.set(filename, content);
      return content;
    } catch (error) {
      console.error(`Failed to load blog ${filename}:`, error);
      return null;
    }
  }

  // URL and tag management methods
  loadTagsFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tags = params.get('tags');
    if (tags) {
      this.selectedTags = new Set(tags.split(',').map(tag => tag.toLowerCase()));
    } else {
      this.selectedTags.clear();
    }
  }

  updateURL() {
    const params = new URLSearchParams(window.location.search);
    if (this.selectedTags.size > 0) {
      params.set('tags', Array.from(this.selectedTags).join(','));
    } else {
      params.delete('tags');
    }
    
    const newURL = params.toString() ? 
      `${window.location.pathname}?${params.toString()}${window.location.hash}` :
      `${window.location.pathname}${window.location.hash}`;
    
    window.history.pushState({}, '', newURL);
  }

  renderTagBadges() {
    if (this.selectedTags.size === 0) return "";
    
    let badges = `<div class="selected-tags-section">`;
    badges += `<div class="selected-tags-label">Filters:</div>`;
    badges += `<div class="selected-tags">`;
    
    for (const tag of Array.from(this.selectedTags)) {
      badges += `<span class="tui-action selected-tag-badge" data-action="removeTag" data-tag="${tag}" title="Click to remove filter: ${tag}">`;
      badges += `<span class="tag-name">${tag}</span>`;
      badges += `<span class="remove-tag-icon">✕</span>`;
      badges += `</span>`;
    }
    
    badges += `<span class="tui-action clear-all-tags" data-action="clearAllTags" title="Clear all tag filters">Clear All</span>`;
    badges += `</div>`;
    badges += `</div>`;
    
    return badges;
  }

  toggleTag(tag) {
    const tagLower = tag.toLowerCase();
    if (this.selectedTags.has(tagLower)) {
      this.selectedTags.delete(tagLower);
    } else {
      this.selectedTags.add(tagLower);
    }
    this.updateURL();
    return this.listBlogs();
  }

  removeTag(tag) {
    this.selectedTags.delete(tag.toLowerCase());
    this.updateURL();
    return this.listBlogs();
  }

  clearAllTags() {
    this.selectedTags.clear();
    this.updateURL();
    return this.listBlogs();
  }

  renderTuiContainer(title = "My Blogs", showBack = false, content = "", footer = "") {
    let output = `<div class="tui-container">`;
    
    // Header
    output += `<div class="tui-header">`;
    output += `<div class="tui-header-top">`;
    output += `<div class="tui-nav-left">`;
    // Context-aware back button for blogs
    const backAction = (this.currentState === 'reading' || this.currentState === 'preview') ? 'backToBlogList' : 'exitTui';
    const backTitle = (this.currentState === 'reading' || this.currentState === 'preview') ? 'Back to blogs' : 'Go back';
    output += `<span class="tui-action back-btn" data-action="${backAction}" title="${backTitle}"><span class="back-arrow"><i class="fa-solid fa-arrow-left"></i></span>Back</span>`;
    output += `</div>`;
    output += `<div class="tui-nav-center">`;
    output += `<h2 class="tui-title">${title}</h2>`;
    output += `</div>`;
    output += `</div>`;
    
    // Selected tags section below back button
    output += this.renderTagBadges();
    
    output += `</div>`;
    
    // Scrollable Content
    output += `<div class="tui-content">`;
    output += content;
    output += `</div>`;
    
    // Footer
    if (footer) {
      output += `<div class="tui-footer">`;
      output += footer;
      output += `</div>`;
    }
    
    output += `</div>`;
    return output;
  }

  async listBlogs(filteredBlogs = null) {
    this.currentState = 'list';
    const index = await this.loadBlogsIndex();
    
    // Load tags from URL if no filtered blogs provided
    if (!filteredBlogs) {
      this.loadTagsFromURL();
    }
    
    let blogs = filteredBlogs || index.blogs;
    
    // Apply tag filters
    if (this.selectedTags.size > 0) {
      blogs = blogs.filter(blog => 
        Array.from(this.selectedTags).every(selectedTag =>
          blog.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
        )
      );
    }
    
    if (!blogs || blogs.length === 0) {
      const hasFilters = this.selectedTags.size > 0;
      const content = hasFilters ? 
        `<div class="no-results">No blogs found with the selected tags.</div>` :
        "No blogs available.";
      return this.renderTuiContainer("My Blogs", false, content);
    }

    let content = "";
    for (const blog of blogs) {
      content += `<div class="blog-item tui-action" data-action="readBlog" data-blog-id="${blog.id}" title="Click to read: ${blog.title}">`;
      content += `<div class="blog-header">`;
      content += `<h3 class="blog-title">${blog.title}</h3>`;
      content += `<span class="blog-date">📅 ${blog.date}</span>`;
      content += `</div>`;
      content += `<div class="blog-summary">${blog.description}</div>`;
      content += `<div class="blog-tags">`;
      for (const tag of blog.tags) {
        const isSelected = this.selectedTags.has(tag.toLowerCase());
        const tagClass = isSelected ? "tag-btn selected" : "tag-btn";
        content += `<span class="tui-action ${tagClass}" data-action="toggleTag" data-tag="${tag}" title="${isSelected ? 'Remove' : 'Add'} tag filter: ${tag}" onclick="event.stopPropagation()">${tag}</span>`;
      }
      content += `</div>`;
      content += `</div>\n`;
    }
    
    return this.renderTuiContainer("My Blogs", false, content);
  }

  async displayBlog(blogId) {
    this.currentState = 'reading';
    this.currentBlog = blogId;
    
    const index = await this.loadBlogsIndex();
    const blog = index.blogs.find(b => b.id === blogId);
    
    if (!blog) {
      const errorContent = `<div class="error-message">Blog '${blogId}' not found. <span class="tui-action inline-cmd" data-action="showList" title="View all blogs">Click here to see available blogs</span>.</div>`;
      return this.renderTuiContainer("Blog Not Found", true, errorContent);
    }

    const content = await this.loadBlogContent(blog.filename);
    if (!content) {
      const errorContent = `<div class="error-message">Failed to load blog content for '${blogId}'.</div>`;
      return this.renderTuiContainer("Error Loading Blog", true, errorContent);
    }

    // Configure marked for better terminal-style rendering
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {}
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });

    const htmlContent = marked.parse(content);
    
    // Blog content with simple tags header (like projects)
    let blogContent = `<div class="project-tags-header">`;
    blogContent += `<div class="blog-tags">`;
    for (const tag of blog.tags) {
      blogContent += `<span class="tui-action tag-btn" data-action="filterByTag" data-tag="${tag}" title="Find more blogs tagged '${tag}'" onclick="event.stopPropagation()">${tag}</span>`;
    }
    blogContent += `</div>`;
    blogContent += `<div class="blog-date">📅 ${blog.date}</div>`;
    blogContent += `</div>`;
    blogContent += `<div class="blog-content">${htmlContent}</div>`;
    
    // Footer - no actions
    let footer = ``;
    
    return this.renderTuiContainer(blog.title, true, blogContent, footer);
  }

  async getBlogHead(blogId, lines = 10) {
    const index = await this.loadBlogsIndex();
    const blog = index.blogs.find(b => b.id === blogId);
    
    if (!blog) {
      return `Blog '${blogId}' not found.`;
    }

    const content = await this.loadBlogContent(blog.filename);
    if (!content) {
      return `Failed to load blog content for '${blogId}'.`;
    }

    const contentLines = content.split('\n');
    const headLines = contentLines.slice(0, lines);
    return `<pre class="blog-head">${headLines.join('\n')}</pre>`;
  }

  async searchBlogs(pattern) {
    const index = await this.loadBlogsIndex();
    let results = [];

    for (const blog of index.blogs) {
      const content = await this.loadBlogContent(blog.filename);
      if (content) {
        const lines = content.split('\n');
        const matches = lines
          .map((line, index) => ({ line, number: index + 1 }))
          .filter(({ line }) => line.toLowerCase().includes(pattern.toLowerCase()));

        if (matches.length > 0) {
          results.push({
            blog,
            matches: matches.slice(0, 5) // Limit to first 5 matches per blog
          });
        }
      }
    }

    if (results.length === 0) {
      return `No matches found for '${pattern}' in blogs.`;
    }

    let output = `Search results for '<span class="search-term">${pattern}</span>':\n\n`;
    for (const { blog, matches } of results) {
      output += `<span class="search-result">`;
      output += `📄 <span class="blog-title tui-action" data-action="readBlog" data-blog-id="${blog.id}" title="Click to read: ${blog.title}">${blog.title}</span>\n`;
      for (const { line, number } of matches) {
        const highlightedLine = line.replace(
          new RegExp(pattern, 'gi'),
          `<span class="highlight">${pattern}</span>`
        );
        output += `  <span class="line-number">${number}:</span> ${highlightedLine}\n`;
      }
      output += `\n</span>`;
    }
    
    return output;
  }

  async findBlogsByTag(tag) {
    this.currentState = 'filtered';
    this.currentFilter = { type: 'tag', value: tag };
    
    const index = await this.loadBlogsIndex();
    const matchingBlogs = index.blogs.filter(blog => 
      blog.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );

    if (matchingBlogs.length === 0) {
      const noResultsContent = `<div class="no-results">No blogs found with tag '<span class="search-term">${tag}</span>'.</div>`;
      return this.renderTuiContainer(`No blogs found with tag: ${tag}`, true, noResultsContent);
    }

    return await this.listBlogs(matchingBlogs);
  }

  async searchBlogs(pattern) {
    this.currentState = 'search';
    this.currentFilter = { type: 'search', value: pattern };
    
    const index = await this.loadBlogsIndex();
    let results = [];

    for (const blog of index.blogs) {
      const content = await this.loadBlogContent(blog.filename);
      if (content) {
        const lines = content.split('\n');
        const matches = lines
          .map((line, index) => ({ line, number: index + 1 }))
          .filter(({ line }) => line.toLowerCase().includes(pattern.toLowerCase()));

        if (matches.length > 0) {
          results.push(blog);
        }
      }
    }

    if (results.length === 0) {
      const noResultsContent = `<div class="no-results">No matches found for '<span class="search-term">${pattern}</span>' in blogs.</div>`;
      return this.renderTuiContainer(`No results for: ${pattern}`, true, noResultsContent);
    }

    return await this.listBlogs(results);
  }

  async previewBlog(blogId, lines = 10) {
    this.currentState = 'preview';
    this.currentBlog = blogId;
    
    const index = await this.loadBlogsIndex();
    const blog = index.blogs.find(b => b.id === blogId);
    
    if (!blog) {
      const errorContent = `<div class="error-message">Blog '${blogId}' not found.</div>`;
      return this.renderTuiContainer("Blog Not Found", true, errorContent);
    }

    const content = await this.loadBlogContent(blog.filename);
    if (!content) {
      const errorContent = `<div class="error-message">Failed to load blog content for '${blogId}'.</div>`;
      return this.renderTuiContainer("Error Loading Preview", true, errorContent);
    }

    const contentLines = content.split('\n');
    const headLines = contentLines.slice(0, lines);
    
    let previewContent = `<div class="blog-meta-header">`;
    previewContent += `<div class="blog-meta">📅 ${blog.date} • 🏷️ ${blog.tags.join(', ')}</div>`;
    previewContent += `<div class="preview-actions">`;
    previewContent += `<span class="tui-action action-btn read-btn" data-action="readBlog" data-blog-id="${blogId}" title="Read full blog">📖 Read Full</span>`;
    previewContent += `</div>`;
    previewContent += `</div>\n\n`;
    previewContent += `<div class="blog-head">${headLines.join('\n')}</div>`;
    
    return this.renderTuiContainer(`Preview: ${blog.title}`, true, previewContent);
  }

  // TUI State Management Methods
  async handleTuiAction(action, data = {}) {
    switch (action) {
      case 'showList':
        this.currentFilter = null; // Clear any active filters
        return await this.listBlogs();
      case 'readBlog':
        return await this.displayBlog(data.blogId);
      case 'previewBlog':
        return await this.previewBlog(data.blogId);
      case 'filterByTag':
        return await this.findBlogsByTag(data.tag);
      case 'toggleTag':
        return await this.toggleTag(data.tag);
      case 'removeTag':
        return await this.removeTag(data.tag);
      case 'clearAllTags':
        return await this.clearAllTags();

      case 'searchBlogs':
        this.currentFilter = { type: 'search', value: data.query };
        return await this.searchBlogs(data.query);
      default:
        this.currentFilter = null;
        return await this.listBlogs();
    }
  }
}

// Project TUI Manager - handles project TUI state and operations  
class ProjectManager {
  constructor() {
    this.currentState = 'list';
    this.projectsIndex = null;
    this.projectsCache = new Map();
    this.currentFilter = null;
    this.selectedTags = new Set();
  }

  async loadProjectsIndex() {
    if (this.projectsIndex) return this.projectsIndex;
    
    try {
      const response = await fetch('./projects/index.json');
      this.projectsIndex = await response.json();
      return this.projectsIndex;
    } catch (error) {
      console.error('Failed to load projects index:', error);
      return { projects: [] };
    }
  }

  async loadProjectContent(filename) {
    if (this.projectsCache.has(filename)) {
      return this.projectsCache.get(filename);
    }

    try {
      const response = await fetch(`./projects/${filename}`);
      const content = await response.text();
      this.projectsCache.set(filename, content);
      return content;
    } catch (error) {
      console.error(`Failed to load project ${filename}:`, error);
      return null;
    }
  }

  renderTuiContainer(title = "My Projects", showBack = false, content = "", footer = "") {
    let output = `<div class="tui-container">`;
    
    // Header
    output += `<div class="tui-header">`;
    output += `<div class="tui-header-top">`;
    output += `<div class="tui-nav-left">`;
    // Context-aware back button for projects
    const backAction = (this.currentState === 'viewing') ? 'backToProjectList' : 'exitTui';
    const backTitle = (this.currentState === 'viewing') ? 'Back to projects' : 'Go back';
    output += `<span class="tui-action back-btn" data-action="${backAction}" title="${backTitle}"><span class="back-arrow"><i class="fa-solid fa-arrow-left"></i></span>Back</span>`;
    output += `</div>`;
    output += `<div class="tui-nav-center">`;
    output += `<h2 class="tui-title">${title}</h2>`;
    output += `</div>`;
    output += `</div>`;
    output += `</div>`;
    
    // Scrollable Content
    output += `<div class="tui-content">`;
    output += content;
    output += `</div>`;
    
    // Footer
    if (footer) {
      output += `<div class="tui-footer">`;
      output += footer;
      output += `</div>`;
    }
    
    output += `</div>`;
    return output;
  }

  async listProjects(filteredProjects = null) {
    this.currentState = 'list';
    const index = await this.loadProjectsIndex();
    
    // Load tags from URL if no filtered projects provided
    if (!filteredProjects) {
      this.loadTagsFromURL();
    }
    
    let projects = filteredProjects || index.projects;
    
    // Apply tag filters
    if (this.selectedTags.size > 0) {
      projects = projects.filter(project => 
        Array.from(this.selectedTags).every(selectedTag =>
          project.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
        )
      );
    }
    
    if (!projects || projects.length === 0) {
      const hasFilters = this.selectedTags.size > 0;
      const content = hasFilters ? 
        `<div class="no-results">No projects found with the selected tags.</div>` :
        "No projects available.";
      return this.renderTuiContainer("My Projects", false, content);
    }

    let content = "";
    for (const project of projects) {
      content += `<div class="blog-item tui-action" data-action="viewProject" data-project-id="${project.id}" title="Click to view: ${project.title}">`;
      content += `<div class="blog-header">`;
      content += `<h3 class="blog-title">${project.title}</h3>`;
      content += `</div>`;
      content += `<div class="blog-summary">${project.description}</div>`;
      content += `<div class="blog-tags">`;
      for (const tag of project.tags) {
        const isSelected = this.selectedTags.has(tag.toLowerCase());
        const tagClass = isSelected ? "tag-btn selected" : "tag-btn";
        content += `<span class="tui-action ${tagClass}" data-action="toggleTag" data-tag="${tag}" title="${isSelected ? 'Remove' : 'Add'} tag filter: ${tag}" onclick="event.stopPropagation()">${tag}</span>`;
      }
      content += `</div>`;
      content += `</div>\n`;
    }
    
    return this.renderTuiContainer("My Projects", false, content);
  }

  async viewProject(projectId) {
    this.currentState = 'viewing';
    
    const index = await this.loadProjectsIndex();
    const project = index.projects.find(p => p.id === projectId);
    
    if (!project) {
      const errorContent = `<div class="error-message">Project '${projectId}' not found. <span class="tui-action inline-cmd" data-action="showProjectList" title="View all projects">Click here to see available projects</span>.</div>`;
      return this.renderTuiContainer("Project Not Found", true, errorContent);
    }

    // Load and render markdown content if available
    let markdownContent = "";
    if (project.filename) {
      const content = await this.loadProjectContent(project.filename);
      if (content) {
        // Configure marked for better terminal-style rendering
        marked.setOptions({
          highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
              try {
                return hljs.highlight(code, { language: lang }).value;
              } catch (err) {}
            }
            return hljs.highlightAuto(code).value;
          },
          breaks: true,
          gfm: true
        });

        markdownContent = marked.parse(content);
      }
    }

    // Project content with simple tags header
    let projectContent = `<div class="project-tags-header">`;
    projectContent += `<div class="blog-tags">`;
    for (const tag of project.tags) {
      projectContent += `<span class="tui-action tag-btn" data-action="filterByTag" data-tag="${tag}" title="Find more projects tagged '${tag}'" onclick="event.stopPropagation()">${tag}</span>`;
    }
    projectContent += `</div>`;
    projectContent += `</div>`;
    
    // Add markdown content if available, otherwise use basic description
    if (markdownContent) {
      projectContent += `<div class="project-content">${markdownContent}</div>`;
    } else {
      projectContent += `<div class="project-description">`;
      projectContent += `<h3>About This Project</h3>`;
      projectContent += `<p>${project.description}</p>`;
      projectContent += `</div>`;
    }
    
    // Footer - no actions
    let footer = ``;
    
    return this.renderTuiContainer(project.title, true, projectContent, footer);
  }

  async findProjectsByTag(tag) {
    this.currentState = 'filtered';
    this.currentFilter = { type: 'tag', value: tag };
    
    const index = await this.loadProjectsIndex();
    const matchingProjects = index.projects.filter(project => 
      project.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );

    if (matchingProjects.length === 0) {
      const noResultsContent = `<div class="no-results">No projects found with tag '<span class="search-term">${tag}</span>'.</div>`;
      return this.renderTuiContainer(`No projects found with tag: ${tag}`, true, noResultsContent);
    }

    return await this.listProjects(matchingProjects);
  }

  async toggleTag(tag) {
    const tagLower = tag.toLowerCase();
    if (this.selectedTags.has(tagLower)) {
      this.selectedTags.delete(tagLower);
    } else {
      this.selectedTags.add(tagLower);
    }
    
    this.updateURL();
    return await this.listProjects();
  }

  async removeTag(tag) {
    this.selectedTags.delete(tag.toLowerCase());
    this.updateURL();
    return await this.listProjects();
  }

  async clearAllTags() {
    this.selectedTags.clear();
    this.updateURL();
    return await this.listProjects();
  }

  updateURL() {
    const url = new URL(window.location);
    if (this.selectedTags.size > 0) {
      url.searchParams.set('projectTags', Array.from(this.selectedTags).join(','));
    } else {
      url.searchParams.delete('projectTags');
    }
    window.history.replaceState({}, '', url);
  }

  loadTagsFromURL() {
    const url = new URL(window.location);
    const tagsParam = url.searchParams.get('projectTags');
    if (tagsParam) {
      this.selectedTags = new Set(tagsParam.split(',').map(tag => tag.trim().toLowerCase()));
    }
  }

  // TUI State Management Methods
  async handleTuiAction(action, data = {}) {
    switch (action) {
      case 'showProjectList':
        this.currentFilter = null; // Clear any active filters
        return await this.listProjects();
      case 'viewProject':
        return await this.viewProject(data.projectId);
      case 'filterByTag':
        return await this.findProjectsByTag(data.tag);
      case 'toggleTag':
        return await this.toggleTag(data.tag);
      case 'removeTag':
        return await this.removeTag(data.tag);
      case 'clearAllTags':
        return await this.clearAllTags();
      default:
        this.currentFilter = null;
        return await this.listProjects();
    }
  }
}

// Commands module - handles all command definitions and execution
export class CommandManager {
  constructor() {
    this.blogManager = new BlogManager();
    this.projectManager = new ProjectManager();
    this.commands = {
      help: {
        content: () => {
          // Dynamically build the help text
          let helpText = "Available commands:\n\n";
          const commandWidth = 20; // Fixed width for commands (adjust as needed)
          for (const [key, command] of Object.entries(this.commands)) {
            // Only show public commands (not internal ones)
            if (!command.internal && command.description) {
              const paddedCommand = key.padEnd(commandWidth); // Pad command to fixed width
              helpText += `${paddedCommand} ${command.description}\n`; // Add padded command with description
            }
          }
          return helpText.trim();
        },
        description: "Displays a list of available commands",
      },
      name: {
        content: "Shreyam Pokharel",
        description: "Displays my name",
      },
      bio: {
        content:
          "I am a passionate Linux enthusiast with a strong penchant for Python programming. I am also familiar with C, C++, Bash and a little bit JavaScript. During my free time, I love delving into innovative programming and tech concepts. I am also interested in learning about GNU/Linux tools and concepts.",
        description: "Shows my bio",
      },
      image: {
        content: () => {
          return "<img src='shreyam.jpg' alt='Shreyam Pokharel' class='profile-image' />";
        },
        description: "Displays my image",
      },
      contacts: {
        content: () => {
          const email = "<a href='mailto:pshreyam@gmail.com' class='link'>pshreyam@gmail.com</a>";
          const linkedin = "<a href='https://www.linkedin.com/in/shreyam-pokharel/' target='_blank' class='link'>shreyam-pokharel</a>";
          const github = "<a href='https://github.com/pshreyam' target='_blank' class='link'>@pshreyam</a>";
          return `Email: ${email} <br>LinkedIn: ${linkedin}<br>GitHub: ${github}`;
        },
        description: "Shows my contact details",
      },
      experience: {
        content:
          "- Backend Engineer @ Docsumo (July 2023 - present)\n" +
          "- Python Intern @ Docsumo (April 2023 - July 2023)",
        description: "Lists my professional experience",
      },
      projects: {
        content: () => {
          // Scroll to top when projects command is executed
          setTimeout(() => {
            if (window.terminalUI) {
              window.terminalUI.scrollToTop();
            }
          }, 10);
          return this.projectManager.listProjects();
        },
        description: "Shows my projects with interactive interface",
      },
      education: {
        content:
          "- BE in Computer Engineering @ Kathmandu University (2018 - 2023)\n" +
          "- Secondary Education @ Capital College and Research Center (2016 - 2018)\n" +
          "- School Leaving Certificate @ Paragon Public School (2016)",
        description: "Lists my educational qualifications",
      },
      blogs: {
        content: () => {
          // Scroll to top when blogs command is executed
          setTimeout(() => {
            if (window.terminalUI) {
              window.terminalUI.scrollToTop();
            }
          }, 10);
          return this.blogManager.listBlogs();
        },
        description: "Shows my blogs with interactive interface",
      },
      // Internal commands for TUI functionality (hidden from help)
      "ls": {
        content: (args) => {
          if (args === "blogs") {
            return this.blogManager.listBlogs();
          }
          return "Usage: ls blogs";
        },
        internal: true, // Hidden from help
      },
      cat: {
        content: (blogId) => {
          if (!blogId) {
            return "Usage: cat &lt;blog-id&gt;<br>Use blogs command to see available blogs.";
          }
          return this.blogManager.displayBlog(blogId);
        },
        internal: true, // Hidden from help
      },
      head: {
        content: (blogId, lines = 10) => {
          if (!blogId) {
            return "Usage: head &lt;blog-id&gt; [lines]<br>Use blogs command to see available blogs.";
          }
          const numLines = parseInt(lines) || 10;
          return this.blogManager.getBlogHead(blogId, numLines);
        },
        internal: true, // Hidden from help
      },
      grep: {
        content: (pattern, target) => {
          if (!pattern) {
            return "Usage: grep &lt;pattern&gt; blogs<br>Search for text in all blogs.";
          }
          if (target === "blogs") {
            return this.blogManager.searchBlogs(pattern);
          }
          return "Usage: grep &lt;pattern&gt; blogs";
        },
        internal: true, // Hidden from help
      },
      find: {
        content: (target, flag, value) => {
          if (target === "blogs" && flag === "-tag" && value) {
            return this.blogManager.findBlogsByTag(value);
          }
          return "Usage: find blogs -tag &lt;tag-name&gt;<br>Find blogs by tag.";
        },
        internal: true, // Hidden from help
      },
      hobbies: {
        content:
          "- Exploring programming languages and tinkering my operating system\n" +
          "- Singing and participating in various sports",
        description: "Lists my hobbies",
      },
      history: {
        content: () => {
          return this.getCommandHistory().join("\n");
        },
        description: "Fetches the history of input commands",
      },
      clear: {
        content: () => {
          return this.clearTerminal();
        },
        description: "Clears the terminal output (Ctrl + L does the same)",
      },
      ping: {
        content: "pong",
        description: "Checks if the terminal is active and responds with 'pong'",
      },
      toggle_theme: {
        content: () => {
          return this.toggleTheme();
        },
        description: "Switch between light and dark themes",
      },
      reset: {
        content: () => {
          return this.resetPreferences();
        },
        description: "Reset the theme preference and command history",
      },
    };
    
    this.commandHistory = JSON.parse(localStorage.getItem("commandHistory")) || [];
    this.historyIndex = this.commandHistory.length;
  }

  // Section runners
  runHomeSection() {
    const homeCommands = ["name", "image", "bio", "contacts", "experience", "education"];
    homeCommands.forEach((item) => {
      window.terminalUI.handleCommand(item);
    });
  }

  runBlogsSection() {
    const blogsCommands = ['blogs'];
    blogsCommands.forEach(cmd => {
      window.terminalUI.handleCommand(cmd);
    });
  }

  runProjectsSection() {
    const projectsCommands = ['projects'];
    projectsCommands.forEach(cmd => {
      window.terminalUI.handleCommand(cmd);
    });
  }

  runContactsSection() {
    const contactsCommands = ['contacts'];
    contactsCommands.forEach(cmd => {
      window.terminalUI.handleCommand(cmd);
    });
  }

  runTerminalSection() {
    // Clear terminal but don't run any automatic commands
    // This is the interactive terminal where users can type commands
  }

  // Command execution
  executeCommand(input) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    if (command in this.commands) {
      let response;
      
      if (typeof this.commands[command].content === "function") {
        // Handle async commands
        const result = this.commands[command].content(...args);
        if (result instanceof Promise) {
          // For async commands, we need to handle them differently
          result.then(content => {
            if (command !== "clear") {
              window.terminalUI.displayAsyncResult(input, content);
            }
          }).catch(error => {
            window.terminalUI.displayAsyncResult(input, `Error: ${error.message}`, true);
          });
          return "Loading..."; // Temporary message
        } else {
          response = result;
        }
      } else {
        response = this.commands[command].content;
      }

      if (command === "clear") return;
      return response || "";
    } else {
      return null; // Command not found
    }
  }

  // Command history management
  addToHistory(command) {
    if (this.commandHistory.length === 0 || 
        this.commandHistory[this.commandHistory.length - 1] !== command) {
      this.commandHistory.push(command);
      localStorage.setItem("commandHistory", JSON.stringify(this.commandHistory));
      this.historyIndex = this.commandHistory.length;
    }
  }

  getCommandHistory() {
    return this.commandHistory;
  }

  getHistoryCommand(direction) {
    if (direction === 'up' && this.historyIndex > 0) {
      this.historyIndex--;
      return this.commandHistory[this.historyIndex];
    } else if (direction === 'down' && this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      return this.commandHistory[this.historyIndex];
    } else if (direction === 'down' && this.historyIndex === this.commandHistory.length - 1) {
      this.historyIndex = this.commandHistory.length;
      return "";
    }
    return null;
  }

  // Utility functions
  clearTerminal() {
    window.terminalUI.clearOutput();
    window.uiManager.displayIntroduction();
  }

  toggleTheme() {
    if (window.uiManager.currentTheme === "dark") {
      document.body.classList.add("light-theme");
      window.uiManager.currentTheme = "light";
      localStorage.setItem("theme", "light");
      window.uiManager.updateThemeIcon();
      return "Switched to Light Theme.";
    } else {
      document.body.classList.remove("light-theme");
      window.uiManager.currentTheme = "dark";
      localStorage.setItem("theme", "dark");
      window.uiManager.updateThemeIcon();
      return "Switched to Dark Theme.";
    }
  }

  resetPreferences() {
    localStorage.clear();
    this.commandHistory = [];
    this.historyIndex = -1;
    location.reload();
  }
}
