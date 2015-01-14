describe('Password Class', function () {
    var pass;

    beforeEach(function () {
        pass = new Password();
    });

    describe('newing up', function () {

        beforeEach(function () {
            sinon.stub(Password.prototype, 'generateHash').returns('definitelyAHash');
        });

        afterEach(function () {
            Password.prototype.generateHash.restore();
        });

        it('generates a new unique guid for every password', function () {
            var i, iterations = 30, ids = [];

            for (i = 0; i < iterations; ++i) {
                pass = new Password();

                pass.id.length.should.equal(36)

                ids.push(pass.id);
            }

            // Make sure all GUIDs created were unique.
            ids.filter(function(item, i){return ids.indexOf(item) === i;}).length
                .should.equal(iterations);

        });

        it('sets the type to SGP by default', function () {

            pass.type.should.equal('SGP');

            pass = new Password({ type: 'foo' });

            pass.type.should.equal('SGP');

        });

        it('sets the name from options, defaulting to "Default"', function () {

            (new Password({ })).name.should.equal('Default');
            (new Password({ name: 'foo' })).name.should.equal('foo');
            (new Password({ name: 'MyPass' })).name.should.equal('MyPass');

        });

        it('sets the stealth password from options defaulting to ""', function () {

            (new Password({ })).stealth.should.equal('');
            (new Password({ stealth: 'foo' })).stealth.should.equal('foo');
            (new Password({ stealth: 'abcdefg' })).stealth.should.equal('abcdefg');

        });

        it('sets the number to Number(options.length), defaulting to 10', function () {

            (new Password({ })).length.should.equal(10);
            (new Password({ length: 20 })).length.should.equal(20);
            (new Password({ length: '10' })).length.should.equal(10);

        });

        it('sets the length to 4 if options.length is less than 4', function () {

            (new Password({ length: 3 })).length.should.equal(4);
            (new Password({ length: '2' })).length.should.equal(4);
            (new Password({ length: '0' })).length.should.equal(4);

        });

        it('sets the length to 24 if options.length is greater than 24', function () {

            (new Password({ length: 25 })).length.should.equal(24);
            (new Password({ length: '30' })).length.should.equal(24);
            (new Password({ length: Infinity })).length.should.equal(24);

        });

        it('sets the session boolean to a Boolean of options.session', function () {

            (new Password({ })).session.should.equal(false);
            (new Password({ session: true })).session.should.equal(true);
            (new Password({ session: 0 })).session.should.equal(false);
            (new Password({ session: {} })).session.should.equal(true);
            (new Password({ session: NaN })).session.should.equal(false);
            (new Password({ session: '' })).session.should.equal(false);

        });

        it('sets the always boolean to a Boolean of options.always', function () {

            (new Password({ })).always.should.equal(false);
            (new Password({ always: true })).always.should.equal(true);
            (new Password({ always: 0 })).always.should.equal(false);
            (new Password({ always: {} })).always.should.equal(true);
            (new Password({ always: NaN })).always.should.equal(false);
            (new Password({ always: '' })).always.should.equal(false);

        });

        it('sets the hash to a generated hash of the password, if options.hash is truthy', function () {

            (new Password({ password: 'definitelyAPassword', hash: true })).hash.should.equal('definitelyAHash');
            (new Password({ password: 'definitelyAPassword', hash: false })).hash.should.equal(false);
            sinon.assert.alwaysCalledWithExactly(Password.prototype.generateHash, 'definitelyAPassword');

            Password.prototype.generateHash.reset();
            (new Password({ password: 'alsoAPassword', hash: 1 })).hash.should.equal('definitelyAHash');
            (new Password({ password: 'alsoAPassword', hash: 0 })).hash.should.equal(false);
            sinon.assert.alwaysCalledWithExactly(Password.prototype.generateHash, 'alsoAPassword');

        });

    });

    describe('generating hashes', function () {

        it('uses bcrypt', function () {

            dcodeIO.bcrypt.compareSync('bacon', pass.generateHash('bacon')).should.equal(true);
            dcodeIO.bcrypt.compareSync('foobar', pass.generateHash('foobar')).should.equal(true);
            dcodeIO.bcrypt.compareSync('wrong', pass.generateHash('right')).should.equal(false);

            pass.password = 'foo';
            dcodeIO.bcrypt.compareSync('foo', pass.generateHash()).should.equal(true);
            dcodeIO.bcrypt.compareSync('bar', pass.generateHash()).should.equal(false);

        });

        it('can be compared with password#checkHash', function () {

            pass.checkHash('bacon', pass.generateHash('bacon')).should.equal(true);
            pass.checkHash('foobar', pass.generateHash('foobar')).should.equal(true);
            pass.checkHash('wrong', pass.generateHash('right')).should.equal(false);

            pass.password = 'foo';
            pass.checkHash('foo', pass.generateHash()).should.equal(true);
            pass.checkHash('bar', pass.generateHash()).should.equal(false);

            pass.password = 'foo';
            pass.hash = pass.generateHash();
            pass.checkHash('foo').should.equal(true);
            pass.checkHash('bar').should.equal(false);

        });

    });

    describe('.parseUrl', function () {

        it('returns just the domain name from a URL', function () {

            Password.parseUrl('http://www.google.com')
                .should.equal('www.google.com');

            Password.parseUrl('http://some.subdomains.www.google.com')
                .should.equal('some.subdomains.www.google.com');

            Password.parseUrl('https://www.google.co.uk/webhp?sourceid=chrome-instant&ie=UTF-8&hl=en#q=cheese')
                .should.equal('www.google.co.uk');

            Password.parseUrl('//smalldomain.butlongtld.museum')
                .should.equal('smalldomain.butlongtld.museum');

            Password.parseUrl('//a.a.a')
                .should.equal('a.a.a');

            Password.parseUrl('ws://very.long.set.of.subdomains.in.a.verylongdomain.localhost')
                .should.equal('very.long.set.of.subdomains.in.a.verylongdomain.localhost');

            Password.parseUrl('http://localhost:3000')
                .should.equal('localhost');

        });

        describe('with true as second argument', function () {

            it('returns only the domain and tld if passed true as second argument', function () {

                Password.parseUrl('http://www.google.com', true)
                    .should.equal('google.com');

                Password.parseUrl('http://some.subdomains.www.google.com', true)
                    .should.equal('google.com');

                Password.parseUrl('//smalldomain.butlongtld.museum', true)
                    .should.equal('butlongtld.museum');

                Password.parseUrl('//a.a.a', true)
                    .should.equal('a.a');

                Password.parseUrl('ws://very.long.set.of.subdomains.in.a.verylongdomain.localhost', true)
                    .should.equal('verylongdomain.localhost');

                Password.parseUrl('http://localhost:3000', true)
                    .should.equal('localhost');

            });

            it('is aware of SLD (second level domains), e.g co.uk', function () {

                Password.parseUrl('https://www.google.co.uk/webhp?sourceid=chrome-instant&ie=UTF-8&hl=en#q=cheese', true)
                    .should.equal('google.co.uk');

                Password.parseUrl('http://www.google.ac.uk', true)
                    .should.equal('google.ac.uk');

                Password.parseUrl('http://something.foo.bar.fm.br', true)
                    .should.equal('bar.fm.br');

                Password.parseUrl('http://something.foo.bar.assedic.fr', true)
                    .should.equal('bar.assedic.fr');

                Password.parseUrl('http://beep.boop.sa.com', true)
                    .should.equal('boop.sa.com');

                Password.parseUrl('http://beep.boop.tlf.nr', true)
                    .should.equal('boop.tlf.nr');

                Password.parseUrl('http://beep.boop.e164.arpa', true)
                    .should.equal('boop.e164.arpa');

            });

            it('does not truncate IP addresses', function () {

                Password.parseUrl('https://192.168.1.1', true)
                    .should.equal('192.168.1.1');

                Password.parseUrl('https://127.0.0.1', true)
                    .should.equal('127.0.0.1');

            });

        });

    });

    describe('.generators', function () {

        describe('SGP', function () {

            it('encodes a password differently for each domain name', function () {

                Password.generators.SGP('apass!', 'google.com', 8)
                    .should.equal('aPq11r8Y');

                Password.generators.SGP('apass!', 'github.com', 8)
                    .should.equal('pq8WYI3x');

                Password.generators.SGP('apass!', 'gmail.com', 8)
                    .should.equal('iSc7G5fl');

                Password.generators.SGP('apass!', 'microsoft.com', 8)
                    .should.equal('eg3FXFqG');

                Password.generators.SGP('apass!', 'not a domain', 8)
                    .should.equal('zZWUhEg6');

            });

            it('will generate passwords of a length based on the length param', function () {

                Password.generators.SGP('apass!', 'google.com', 5)
                    .should.equal('aPq11');

                Password.generators.SGP('apass!', 'google.com', 7)
                    .should.equal('aPq11r8');

                Password.generators.SGP('apass!', 'google.com', 8)
                    .should.equal('aPq11r8Y');

                Password.generators.SGP('apass!', 'google.com', 10)
                    .should.equal('aPq11r8Yf0');

                Password.generators.SGP('apass!', 'google.com', 12)
                    .should.equal('aPq11r8Yf09h');

                Password.generators.SGP('apass!', 'google.com', 13)
                    .should.equal('aPq11r8Yf09hB');

            });

            it('will use a different number of iterations for longer passwords', function () {

                Password.generators.SGP('apass!', 'google.com', 14)
                    .should.equal('tPbLGQncNAarP0');

                Password.generators.SGP('apass!', 'google.com', 15)
                    .should.equal('tPbLGQncNAarP0P');

                Password.generators.SGP('apass!', 'google.com', 20)
                    .should.equal('tPbLGQncNAarP0Po5iuC');

                Password.generators.SGP('apass!', 'google.com', 32)
                    .should.equal('tPbLGQncNAarP0Po5iuC3AAA');

            });

        });

    });

    describe('generating passwords', function () {

        beforeEach(function () {
            sinon.stub(Password, 'parseUrl').returnsArg(0);
            sinon.stub(Password.generators, 'SGP');
        });

        afterEach(function () {
            Password.parseUrl.restore();
            Password.generators.SGP.restore();
        });

        it('calls the generator of pass.type with password, domain and length', function () {
            pass.length = 10;
            pass.generate('abc', 'google.com', true);
            sinon.assert.calledWithExactly(Password.generators.SGP, 'abc', 'google.com', 10);

            pass.length = 24;
            pass.generate('foo', 'bar.bar', true);
            sinon.assert.calledWithExactly(Password.generators.SGP, 'foo', 'bar.bar', 24);
        });

        it('calls parseUrl with the 2nd and 3rd arguments', function () {
            pass.generate('abc', 'google.com', true);
            sinon.assert.calledWithExactly(Password.parseUrl, 'google.com', true);

            pass.generate('abc', 'google.com', false);
            sinon.assert.calledWithExactly(Password.parseUrl, 'google.com', false);
        });

        it('encodes passwords with the stealth password appended to the master password', function () {

            pass.stealth = 'A';
            pass.length = 12;
            pass.generate('1234', 'google.com', true);
            sinon.assert.calledWithExactly(Password.generators.SGP, '1234A', 'google.com', 12);

            pass.stealth = 'abc123';
            pass.length = 10;
            pass.generate('1234', 'google.com', true);
            sinon.assert.calledWithExactly(Password.generators.SGP, '1234abc123', 'google.com', 10);

            pass.password = 'pass';
            pass.generate(null, 'google.com', true);
            sinon.assert.calledWithExactly(Password.generators.SGP, 'passabc123', 'google.com', 10);

        });

    });

});
