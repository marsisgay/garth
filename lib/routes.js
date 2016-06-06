Router.map(function() {
    //These are where all the routes and hyperlinks are stored so that we can navigate between pages

    this.route('index', {
        name: 'index',
        path: '/',
        layoutTemplate: 'index'
    });

    this.route('round', {
        name: 'round',
        path: '/round',
        layoutTemplate: 'round'
    });
    this.route('post', {
        name: 'post',
        path: '/post',
        layoutTemplate: 'post'
    });
   
    this.route('about', {
        name: 'about',
        path: '/about',
        layoutTemplate: 'about'
    });
    
    this.route('instructions', {
        name: 'instructions',
        path: '/instructions',
        layoutTemplate: 'instructions'
    });
    
        this.route('signup', {
        name: 'signup',
        path: '/signup',
        layoutTemplate: 'signup'
    });
    
        this.route('readmore', {
        name: 'readmore',
        path: '/readmore',
        layoutTemplate: 'readmore'
    });

        this.route('main', {
        name: 'main',
        path: '/main',
        layoutTemplate: 'main'
    });

});

