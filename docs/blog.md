---
layout: blog-home
title: Blog Page
---

# AWS Amplify Blog
<ul>
  {% for post in site.posts %}
    <li><a href="{{ post.url }}">{{post.date  | date: "%b %d, %Y" }} \\ {{ post.title }}</a></li>
  {% endfor %}
</ul>