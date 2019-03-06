/* Test */

  class Layout {
    constructor(...pages) {
      this.pages = pages;
    }
  
    load() {
      return Promise.all(this.pages.map(page => page.load()));
    }
  
    show(el) {
      for (let page of this.pages) {
        const div = document.createElement('div');
        page.show(div);
        el.appendChild(div);
      }
    }
  }
  
  class Page {
    constructor(url) {
      this.url = 'views/' + url;
    }
  
    load() {
      return $.get(this.url).then(res => this.html = res);
    }  
  
    show(el) {
      el.innerHTML = this.html;
    }
  }

  class Router {
    constructor(routes, el) {
      this.routes = routes;
      this.el = el;
      window.onhashchange = this.hashChanged.bind(this);
      this.hashChanged();
    }
  
    async hashChanged(ev) {
      if (window.location.hash.length > 0) {
        const pageName = window.location.hash.substr(1);
        this.show(pageName);
      } else if (this.routes['#default']) {
        this.show('#default');
      }
    }
  
    async show(pageName) {
      const page = this.routes[pageName];
      await page.load();
      this.el.innerHTML = '';
      page.show(this.el);
    }
  }

  const HeaderFooterLayout = (innerPage) => new Layout(new Page('menu.html'), new Page(innerPage), new Page('footer.html'));
  
  const r = new Router(
    {
      about: HeaderFooterLayout('about.html'),
      home: new Layout(new Page('menu.html'), new Page('home.html'), new Page('footer.html')),
      ingredients: new Layout(new Page('menu.html'), new Page('ingredients.html'), new Page('footer.html')),
      '#default': new Layout(new Page('menu.html'), new Page('home.html'), new Page('footer.html')),
    },
    document.querySelector('main')
  );