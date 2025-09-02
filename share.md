<a href="#" class="share-btn" data-platform="twitter">Tweet</a>
<script>
  document.querySelectorAll('.share-btn').forEach(btn => {
    const url = encodeURIComponent(location.href);
    const platform = btn.dataset.platform;
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };
    btn.onclick = e => {
      e.preventDefault();
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    };
  });
</script>
