$(function() {
  var templates = {},
      photos;

  $("[type='text/x-handlebars']").each(function() {
    var $template = $(this), 
        name = $(this).attr("id");

    templates[name] = Handlebars.compile($template.html());
  });

  $("[data-type=partial]").each(function() {
    var $partial = $(this);

    Handlebars.registerPartial($partial.attr("id"), $partial.html());
  });

  var slideshow = {
    $el: $("#slideshow"),
    duration: 500,
    nextSlide: function(e) {
      e.preventDefault();
      var $current = this.$el.find("figure:visible"),
          $next = $current.next("figure");

      if (!$next.length) {
        $next = this.$el.find("figure").first();
      };

      $current.fadeOut(this.duration);
      $next.fadeIn(this.duration);
      this.renderPhotoContent($next.attr("data-id"));
    },
    prevSlide: function(e) {
      e.preventDefault();
      var $current = this.$el.find("figure:visible"),
          $prev = $current.prev("figure");

      if (!$prev.length) {
        $prev = this.$el.find("figure").last();
      }

      $current.fadeOut(this.duration);
      $prev.fadeIn(this.duration);
      this.renderPhotoContent($prev.attr("data-id"));

    },
    renderPhotoContent: function(index) {
      $("[name=photo_id]").val(index);
      renderPhotoInfo(+index);
      getCommentFor(index);
    },
    bind: function() {
      this.$el.find("a.prev").on("click", $.proxy(this.prevSlide, this));
      this.$el.find("a.next").on("click", $.proxy(this.nextSlide, this));
    },
    init: function() {
      this.bind();
    }
  };

  $.ajax({
    url: "/photos",
    success: function(json) {
      photos = json;
        renderPhotos();
        renderPhotoInfo(photos[0].id);
        slideshow.init();
        getCommentFor(photos[0].id);
    }
  });

  $("section > header").on("click", ".actions a", function(e) {
    e.preventDefault();

    var $e = $(e.target);

    $.ajax({
      url: $e.attr("href"),
      type: "post",
      data: "photo_id=" + $e.attr("data-id"),
      success: function(json) {
        $e.text(function(i, text) {
          return text.replace(/\d+/, json.total);
        });
      }
    })
  });

  $("form").on("submit", function(e) {
    e.preventDefault();
    var $f = $(this);

    $.ajax({
      url: $f.attr("action"),
      type: $f.attr("method"),
      data: $f.serialize(),
      success: function(json) {
        $("#comments ul").append(templates.comment(json));
      }
    });
  })

  function renderPhotos() {
    $("#slides").html(templates.photos({photos: photos}));
  }
  function renderPhotoInfo(index) {
    var photo = photos.filter(function(item) {
      return item.id === index;
    })[0];
    $("section > header").html(templates.photo_info(photo));
  }
  function getCommentFor(index) {
     $.ajax({
      url: "/comments",
      data: "photo_id=" + index,
      success: function(json) {
        $("#comments ul").html(templates.comments({ comments: json }));
      }
     })
  };
});