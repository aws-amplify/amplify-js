---
layout: blog-home
title: Blog Page
---

# AWS Amplify Blog
<ul>
  {% for post in site.posts %}
    <li><a href="{% if jekyll.environment == 'production' %}{{ site.amplify.baseurl }}{% endif %}{{ post.url }}">{{post.date  | date: "%b %d, %Y" }} \\ {{ post.title }}</a></li>
  {% endfor %}
</ul>