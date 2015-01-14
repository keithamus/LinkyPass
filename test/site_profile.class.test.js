describe('SiteProfile Class', function () {
    var profile;

    beforeEach(function () {
        profile = new SiteProfile();
    });

    describe('newing up', function () {

        it('generates a new unique guid for every site profile', function () {
            var i, iterations = 30, ids = [];

            for (i = 0; i < iterations; ++i) {
                profile = new SiteProfile();

                profile.id.length.should.equal(36)

                ids.push(profile.id);
            }

            // Make sure all GUIDs created were unique.
            ids.filter(function(item, i){return ids.indexOf(item) === i;}).length
                .should.equal(iterations);

        });

        it('sets the type to site_profile by default', function () {

            profile.type.should.equal('site_profile');

            profile = new SiteProfile({ type: 'foo' });

            profile.type.should.equal('site_profile');

        });

        it('sets the domain from options defaulting to ""', function () {

            (new SiteProfile({ })).domain.should.equal('');
            (new SiteProfile({ domain: 'foo' })).domain.should.equal('foo');
            (new SiteProfile({ domain: 'example.com' })).domain.should.equal('example.com');

        });

        it('sets the change domain value from options defaulting to ""', function () {

            (new SiteProfile({ })).changeDomain.should.equal('');
            (new SiteProfile({ changeDomain: 'foo' })).changeDomain.should.equal('foo');
            (new SiteProfile({ changeDomain: 'example.com' })).changeDomain.should.equal('example.com');

        });

        it('sets the append value from options defaulting to ""', function () {

            (new SiteProfile({ })).append.should.equal('');
            (new SiteProfile({ append: 'foo' })).append.should.equal('foo');
            (new SiteProfile({ append: '$' })).append.should.equal('$');

        });

    });

});
