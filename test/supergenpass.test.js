describe('SuperGenPass', function () {

    describe('SGPLocal', function () {

        describe('basic', function () {

            it('encodes a password differently for each domain name', function () {

                SGPLocal('apass!', 'google.com', true, 8).domain
                    .should.equal('google.com');

                SGPLocal('apass!', 'google.com', true, 8).pass
                    .should.equal('aPq11r8Y');

                SGPLocal('apass!', 'github.com', true, 8).domain
                    .should.equal('github.com');

                SGPLocal('apass!', 'github.com', true, 8).pass
                    .should.equal('pq8WYI3x');

                SGPLocal('apass!', 'gmail.com', true, 8).domain
                    .should.equal('gmail.com');

                SGPLocal('apass!', 'gmail.com', true, 8).pass
                    .should.equal('iSc7G5fl');

                SGPLocal('apass!', 'microsoft.com', true, 8).domain
                    .should.equal('microsoft.com');

                SGPLocal('apass!', 'microsoft.com', true, 8).pass
                    .should.equal('eg3FXFqG');

                SGPLocal('apass!', 'not a domain', true, 8).domain
                    .should.equal('not a domain');

                SGPLocal('apass!', 'not a domain', true, 8).pass
                    .should.equal('zZWUhEg6');

            });

            it('will generate passwords of a length based on the length param', function () {

                SGPLocal('apass!', 'google.com', true, 5).pass
                    .should.equal('aPq11');

                SGPLocal('apass!', 'google.com', true, 7).pass
                    .should.equal('aPq11r8');

                SGPLocal('apass!', 'google.com', true, 8).pass
                    .should.equal('aPq11r8Y');

                SGPLocal('apass!', 'google.com', true, 10).pass
                    .should.equal('aPq11r8Yf0');

                SGPLocal('apass!', 'google.com', true, 12).pass
                    .should.equal('aPq11r8Yf09h');

                SGPLocal('apass!', 'google.com', true, 13).pass
                    .should.equal('aPq11r8Yf09hB');

            });

            it('will use a different number of iterations for longer passwords', function () {

                SGPLocal('apass!', 'google.com', true, 14).pass
                    .should.equal('tPbLGQncNAarP0');

                SGPLocal('apass!', 'google.com', true, 15).pass
                    .should.equal('tPbLGQncNAarP0P');

                SGPLocal('apass!', 'google.com', true, 20).pass
                    .should.equal('tPbLGQncNAarP0Po5iuC');

                SGPLocal('apass!', 'google.com', true, 32).pass
                    .should.equal('tPbLGQncNAarP0Po5iuC3AAA');

            });

        });

        describe('stealth passwords', function () {

            it('encodes passwords with the stealth password appended to the master password', function () {

                SGPLocal('1234', 'google.com', true, 8, 'A').domain
                    .should.equal('google.com');

                SGPLocal('1234', 'google.com', true, 8, 'A').pass
                    .should.equal('r0q5BSEw');

                SGPLocal('1234', 'github.com', true, 8, 'A').domain
                    .should.equal('github.com');

                SGPLocal('1234', 'github.com', true, 8, 'A').pass
                    .should.equal('d8QeKznI');

                SGPLocal('1234', 'gmail.com', true, 8, 'A').domain
                    .should.equal('gmail.com');

                SGPLocal('1234', 'gmail.com', true, 8, 'A').pass
                    .should.equal('fYLqtwM9');

                SGPLocal('1234', 'microsoft.com', true, 8, 'A').domain
                    .should.equal('microsoft.com');

                SGPLocal('1234', 'microsoft.com', true, 8, 'A').pass
                    .should.equal('t9zfUpGF');

                SGPLocal('1234', 'not a domain', true, 8, 'A').domain
                    .should.equal('not a domain');

                SGPLocal('1234', 'not a domain', true, 8, 'A').pass
                    .should.equal('b3w8ai5X');

            });

        });

        describe('domain stripping', function () {

            it('only uses the domain name and tld to generate the password', function () {

                SGPLocal('pass', 'http://www.google.com', false, 8).domain
                    .should.equal('google.com');

                SGPLocal('pass', 'http://www.google.com', false, 8).pass
                    .should.equal('tR2XWHtU');

                SGPLocal('pass', 'https://www.google.co.uk/webhp?sourceid=chrome-instant&ie=UTF-8&hl=en#q=cheese', false, 8).domain
                    .should.equal('google.co.uk');

                SGPLocal('pass', 'https://www.google.co.uk/webhp?sourceid=chrome-instant&ie=UTF-8&hl=en#q=cheese', false, 8).pass
                    .should.equal('qTEh8b1T');

                SGPLocal('pass', 'https://www.google.co/webhp?sourceid=chrome-instant&ie=UTF-8&hl=en#q=cheese', false, 8).domain
                    .should.equal('google.co');

                SGPLocal('pass', 'https://www.google.co/webhp?sourceid=chrome-instant&ie=UTF-8&hl=en#q=cheese', false, 8).pass
                    .should.equal('ruag8Sxn');

                SGPLocal('pass', 'https://very.long.set.of.subdomains.in.a.verylongdomain.museum', false, 8).domain
                    .should.equal('verylongdomain.museum');

                SGPLocal('pass', 'https://very.long.set.of.subdomains.in.a.verylongdomain.museum', false, 8).pass
                    .should.equal('vop9D2cl');

            });

        });

    });

});
