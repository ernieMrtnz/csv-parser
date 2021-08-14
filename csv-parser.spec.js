const csv = require('./csv-parser');
const strategy = require('./duplicate-strategy-type');

describe('CSV Parser', () => {
    test('removes duplicate email', async () => {
        return csv.parser('basic-email.csv', strategy.STRATEGY_TYPE.EMAIL)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe,jj@doe.com,1231112233',
                    'another,blank,,1112223333'
                ]);
            });
    });

    test('removes duplicate phone', async () => {
        return csv.parser('basic-phone.csv', strategy.STRATEGY_TYPE.PHONE)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe,jj@doe.com,1231112233',
                    'test,blank,,1231234122'
                ]);
            });
    });
    
    test('removes duplicate email or phone', async () => {
        return csv.parser('basic-email-phone.csv', strategy.STRATEGY_TYPE.EMAIL_PHONE)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe,jj@doe.com,1231112233',
                ]);
            });
    });

    test('handles comma in cell', async () => {
        return csv.parser('cell-contains-comma.csv', strategy.STRATEGY_TYPE.EMAIL)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe,jj@doe.com,1231112233',
                    '"test, Mertz",blank,test@blank.com,1231234122',
                    'another,blank,,1231231234'
                ]);
            });
    });

    test('handles single quote in cell', async () => {
        return csv.parser('cell-contains-single-quote.csv', strategy.STRATEGY_TYPE.PHONE)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe\'s,jj@doe.com,1231112233',
                    '"test, Mert\'s",blank,test@blank.com,1231234122'
                ]);
            });
    });

    test('handles spaces in cell', async () => {
        return csv.parser('cell-contains-spaces.csv', strategy.STRATEGY_TYPE.EMAIL)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe\'s,jj@doe.com,1231112233',
                    'test         ,blank,               ,1231234122',
                    'another,blank,,1231231234'
                ]);
            });
    });

    test('handles double quote in cell', async () => {
        return csv.parser('cell-contains-double-quote.csv', strategy.STRATEGY_TYPE.EMAIL)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe\'s,jj@doe.com,1231112233',
                    'test,blank,test@blank.com,1231234122',
                    'another,"""blank""",,1231231234'
                ]);
            });
    });

    test('handles multibyte character in cell', async () => {
        return csv.parser('cell-contains-multibyte.csv', strategy.STRATEGY_TYPE.PHONE)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe\'s,jj@doe.com,1231112233',
                    'test,ʤ,test@blank.com,1231234122'
                ]);
            });
    });

    test('handles new line in cell', async () => {
        return csv.parser('cell-contains-new-line.csv', strategy.STRATEGY_TYPE.PHONE)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'sam,smith,ssmith@smith.com,1231231234',
                    'jo,doe\'s,jj@doe.com,1231112233',
                    'test\\n,blank\\n,test@blank.com,1231234122'
                ]);
            });
    });

    test('handles empty values in columns', async () => {
        return csv.parser('empty-file.csv', strategy.STRATEGY_TYPE.EMAIL)
            .then((resp) => {
                expect(resp[1]).toEqual([]);
            });
    });

    test('file not found', async () => {
        return expect(csv.parser('cell-2.csv', strategy.STRATEGY_TYPE.EMAIL_PHONE))
                .rejects.toMatch('File was not found');
    });

    test('incorrect duplicate strategy type', async () => {
        return expect(csv.parser('basic-email.csv', strategy.STRATEGY_TYPE.Email))
                .rejects.toMatch('Incorrect duplicate strategy type. Please enter one of the following: email, phone, both');
    });

    test('handle large input file', async () => {
        return csv.parser('large-input-email.csv', strategy.STRATEGY_TYPE.PHONE)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'Fiann,Phelps,fphelps0@yellowpages.com,1813737985',
                    'Edithe,Doxsey,edoxsey1@slashdot.org,6616477247',
                    'Darlene,Gladtbach,dgladtbach2@ifeng.com,2655218285',
                    'Drusilla,Rugiero,drugiero3@issuu.com,1664776255',
                    'Jacky,Goshawke,,2582002122',
                    'Raven,Garner,rgarner5@mac.com,9782747775',
                    'Westbrooke,Bilt,wbilt6@technorati.com,3925628384',
                    'Claude,Scholz,,9372258035',
                    'Sherill,Dumpleton,sdumpleton8@umich.edu,7562743882',
                    'Shanna,Wombwell,swombwell9@newsvine.com,8191273407',
                    "Ange,O'Reagan,aoreagana@google.pl,6286271895",
                    'Marthena,Gladman,mgladmanb@marketwatch.com,1784149016',
                    'Alejandra,Dewett,adewettc@cdbaby.com,',
                    'Allix,Hammett,ahammettd@printfriendly.com,5344424744',
                    'Norbie,Glaves,nglavese@arizona.edu,9602453343',
                    'Gerianne,Bottelstone,gbottelstonef@pagesperso-orange.fr,3525627616',
                    'Dorey,Reinmar,dreinmarg@stumbleupon.com,4605486382',
                    'Garvy,Dur,gdurh@godaddy.com,',
                    'Nikki,Rebichon,nrebichoni@omniture.com,3941801171',
                    'Lurleen,Braiden,lbraidenj@mysql.com,4077156635',
                    'Ber,Jain,bjaink@army.mil,4129033405',
                    'Othilia,Baudasso,sdumpleton8@umich.edu,7554158745',
                    'Nalani,Tanzer,ntanzerm@auda.org.au,9059826204',
                    'Adelice,Paschek,apaschekn@huffingtonpost.com,5054623052',
                    'Orelie,Benko,obenkoo@amazonaws.com,5557933885',
                    'Burk,Hoyte,bhoytep@cnbc.com,9564062849',
                    'Lissy,Hayselden,lhayseldenq@hao123.com,7282497520',
                    'Cate,Cristofalo,ccristofalor@fda.gov,1438702227',
                    'Adolphe,Gatlin,agatlins@bandcamp.com,3293986730',
                    'Bettine,Cayette,bcayettet@imdb.com,8325562259',
                    'Wit,Kroin,wkroinu@ebay.co.uk,5829125693',
                    'Jacklin,Seaton,jseatonv@slideshare.net,1583656583',
                    'Timmie,MacElane,,9594100501',
                    'Keeley,Ling,klingx@woothemes.com,9614379572',
                    'Orelia,Blasgen,oblasgeny@barnesandnoble.com,4063183235',
                    'Cobb,Gosdin,cgosdinz@google.es,7691035453',
                    'Cos,Britnell,cbritnell10@example.com,3022468246',
                    'Raviv,Blount,rblount11@google.com.hk,1052050845',
                    'Zulema,Cookley,zcookley12@aboutads.info,5602699867',
                    'Lockwood,Upcott,lupcott13@ow.ly,4678938599',
                    'Emmett,Conville,econville14@unblog.fr,6093662101',
                    'Becca,Rewcastle,brewcastle15@cargocollective.com,7652437802',
                    'Sherman,Hounsome,sdumpleton8@umich.edu,1151287553',
                    'Aldrich,Will,awill17@friendfeed.com,4261222974',
                    'Niles,Mabe,nmabe18@businessweek.com,',
                    'Ange,Stratley,astratley19@exblog.jp,',
                    'Nixie,Reade,,9079766409',
                    'Dunc,Hillen,dhillen1b@dyndns.org,4796314916',
                    'Bertina,Govey,bgovey1c@amazonaws.com,9886747145',
                    "Job,O' Bee,jobee1d@goo.ne.jp,7204163906",
                    'Anatol,Pallin,apallin1e@nasa.gov,3516540859',
                    'Sara-ann,Wickes,swickes1f@newyorker.com,9827926915',
                    'Karlene,MacGillespie,kmacgillespie1g@phpbb.com,8569439089',
                    'Fidelio,Aires,faires1h@topsy.com,5132324932',
                    'Joane,Girardengo,jgirardengo1i@fc2.com,6349660832',
                    'Esme,Esselin,eesselin1j@yahoo.co.jp,3238413995',
                    'Tricia,Hirth,thirth1k@wikipedia.org,2694587175',
                    'Dynah,Fonteyne,dfonteyne1l@bravesites.com,6615388104',
                    'Cacilia,Heilds,cheilds1m@statcounter.com,2575546612',
                    'Margaux,Janaszewski,mjanaszewski1n@howstuffworks.com,1978818141',
                    'Meridith,Sonnenschein,msonnenschein1o@reference.com,1328024684',
                    'Kiel,Klees,kklees1p@yellowpages.com,5182538950',
                    'Addy,Jiggins,ajiggins1q@icq.com,1786291945',
                    'Lemar,Worpole,lworpole1r@cbslocal.com,2564828500',
                    'Michele,Kasher,mkasher1s@ucsd.edu,6409322165',
                    'Frans,Shrubsall,fshrubsall1t@yellowbook.com,5947805425',
                    'Darb,Coo,dcoo1u@bizjournals.com,',
                    'Erv,Jouen,ejouen1v@bravesites.com,8952856162',
                    'Jo,Yurenev,,3668290732',
                    'Rex,Bilsland,rbilsland1x@cdbaby.com,3831280652',
                    'Emily,Chedzoy,echedzoy1y@ihg.com,3234314819',
                    'Ellwood,Dominique,edominique1z@google.it,1395780103',
                    'Shay,Wapplington,,',
                    'Pavlov,Pacitti,ppacitti21@toplist.cz,3738316500',
                    'Anya,Bernardy,abernardy22@adobe.com,6196165586',
                    'Cindra,Peyro,cpeyro23@netlog.com,5928391930',
                    'Hersch,Calleja,hcalleja24@devhub.com,3689118322',
                    'Miguel,Laker,mlaker25@reuters.com,7841165626',
                    'Read,Lindop,rlindop26@ustream.tv,7285113224',
                    'Ingar,Housaman,,3835383186',
                    'Osborne,Ilsley,,8083255217',
                    'Jeramey,Gozard,jgozard29@yolasite.com,2673327107',
                    'Marys,Sorton,msorton2a@sciencedirect.com,7199605011',
                    'Nate,Bachman,nbachman2b@dailymotion.com,2312622371',
                    'Bondie,Toe,btoe2c@sourceforge.net,5629568371',
                    'Ezequiel,Haugh,ehaugh2d@github.com,7585327661',
                    'Carin,Fyall,,9459733593',
                    'Jane,Pickworth,jpickworth2g@timesonline.co.uk,',
                    'Boothe,Daffern,bdaffern2h@comcast.net,9259530233',
                    'Cal,Hovert,chovert2i@answers.com,5595757076',
                    'Vicky,Grigolli,vgrigolli2j@utexas.edu,1172273214',
                    'Keely,Caldero,kcaldero2k@aboutads.info,8934809410',
                    'Suzette,Sim,ssim2l@ucoz.ru,7978038635',
                    'Kristo,Swanson,kswanson2m@ow.ly,9244250078',
                    'Helen,McVeagh,hmcveagh2n@i2i.jp,3343962509',
                    'Ilysa,Grandin,igrandin2o@dedecms.com,6972597571',
                    'Phaidra,Heal,,5459279888',
                    'Diana,Burtwistle,,5182960329'
                ])
            });
    });

    test('handle large input file for email and phone', async () => {
        return csv.parser('large-input-email.csv', strategy.STRATEGY_TYPE.EMAIL_PHONE)
            .then((resp) => {
                expect(resp[1]).toEqual([
                    'Fiann,Phelps,fphelps0@yellowpages.com,1813737985',
                    'Edithe,Doxsey,edoxsey1@slashdot.org,6616477247',
                    'Darlene,Gladtbach,dgladtbach2@ifeng.com,2655218285',
                    'Drusilla,Rugiero,drugiero3@issuu.com,1664776255',
                    'Jacky,Goshawke,,2582002122',
                    'Raven,Garner,rgarner5@mac.com,9782747775',
                    'Westbrooke,Bilt,wbilt6@technorati.com,3925628384',
                    'Claude,Scholz,,9372258035',
                    'Sherill,Dumpleton,sdumpleton8@umich.edu,7562743882',
                    'Shanna,Wombwell,swombwell9@newsvine.com,8191273407',
                    "Ange,O'Reagan,aoreagana@google.pl,6286271895",
                    'Marthena,Gladman,mgladmanb@marketwatch.com,1784149016',
                    'Alejandra,Dewett,adewettc@cdbaby.com,',
                    'Allix,Hammett,ahammettd@printfriendly.com,5344424744',
                    'Norbie,Glaves,nglavese@arizona.edu,9602453343',
                    'Gerianne,Bottelstone,gbottelstonef@pagesperso-orange.fr,3525627616',
                    'Dorey,Reinmar,dreinmarg@stumbleupon.com,4605486382',
                    'Garvy,Dur,gdurh@godaddy.com,',
                    'Nikki,Rebichon,nrebichoni@omniture.com,3941801171',
                    'Lurleen,Braiden,lbraidenj@mysql.com,4077156635',
                    'Ber,Jain,bjaink@army.mil,4129033405',
                    'Nalani,Tanzer,ntanzerm@auda.org.au,9059826204',
                    'Adelice,Paschek,apaschekn@huffingtonpost.com,5054623052',
                    'Orelie,Benko,obenkoo@amazonaws.com,5557933885',
                    'Burk,Hoyte,bhoytep@cnbc.com,9564062849',
                    'Lissy,Hayselden,lhayseldenq@hao123.com,7282497520',
                    'Cate,Cristofalo,ccristofalor@fda.gov,1438702227',
                    'Adolphe,Gatlin,agatlins@bandcamp.com,3293986730',
                    'Bettine,Cayette,bcayettet@imdb.com,8325562259',
                    'Wit,Kroin,wkroinu@ebay.co.uk,5829125693',
                    'Jacklin,Seaton,jseatonv@slideshare.net,1583656583',
                    'Timmie,MacElane,,9594100501',
                    'Keeley,Ling,klingx@woothemes.com,9614379572',
                    'Orelia,Blasgen,oblasgeny@barnesandnoble.com,4063183235',
                    'Cobb,Gosdin,cgosdinz@google.es,7691035453',
                    'Cos,Britnell,cbritnell10@example.com,3022468246',
                    'Raviv,Blount,rblount11@google.com.hk,1052050845',
                    'Zulema,Cookley,zcookley12@aboutads.info,5602699867',
                    'Lockwood,Upcott,lupcott13@ow.ly,4678938599',
                    'Emmett,Conville,econville14@unblog.fr,6093662101',
                    'Becca,Rewcastle,brewcastle15@cargocollective.com,7652437802',
                    'Aldrich,Will,awill17@friendfeed.com,4261222974',
                    'Niles,Mabe,nmabe18@businessweek.com,',
                    'Ange,Stratley,astratley19@exblog.jp,',
                    'Nixie,Reade,,9079766409',
                    'Dunc,Hillen,dhillen1b@dyndns.org,4796314916',
                    'Bertina,Govey,bgovey1c@amazonaws.com,9886747145',
                    "Job,O' Bee,jobee1d@goo.ne.jp,7204163906",
                    'Anatol,Pallin,apallin1e@nasa.gov,3516540859',
                    'Sara-ann,Wickes,swickes1f@newyorker.com,9827926915',
                    'Karlene,MacGillespie,kmacgillespie1g@phpbb.com,8569439089',
                    'Fidelio,Aires,faires1h@topsy.com,5132324932',
                    'Joane,Girardengo,jgirardengo1i@fc2.com,6349660832',
                    'Esme,Esselin,eesselin1j@yahoo.co.jp,3238413995',
                    'Tricia,Hirth,thirth1k@wikipedia.org,2694587175',
                    'Dynah,Fonteyne,dfonteyne1l@bravesites.com,6615388104',
                    'Cacilia,Heilds,cheilds1m@statcounter.com,2575546612',
                    'Margaux,Janaszewski,mjanaszewski1n@howstuffworks.com,1978818141',
                    'Meridith,Sonnenschein,msonnenschein1o@reference.com,1328024684',
                    'Kiel,Klees,kklees1p@yellowpages.com,5182538950',
                    'Addy,Jiggins,ajiggins1q@icq.com,1786291945',
                    'Lemar,Worpole,lworpole1r@cbslocal.com,2564828500',
                    'Michele,Kasher,mkasher1s@ucsd.edu,6409322165',
                    'Frans,Shrubsall,fshrubsall1t@yellowbook.com,5947805425',
                    'Darb,Coo,dcoo1u@bizjournals.com,',
                    'Erv,Jouen,ejouen1v@bravesites.com,8952856162',
                    'Jo,Yurenev,,3668290732',
                    'Rex,Bilsland,rbilsland1x@cdbaby.com,3831280652',
                    'Emily,Chedzoy,echedzoy1y@ihg.com,3234314819',
                    'Ellwood,Dominique,edominique1z@google.it,1395780103',
                    'Shay,Wapplington,,',
                    'Pavlov,Pacitti,ppacitti21@toplist.cz,3738316500',
                    'Anya,Bernardy,abernardy22@adobe.com,6196165586',
                    'Cindra,Peyro,cpeyro23@netlog.com,5928391930',
                    'Hersch,Calleja,hcalleja24@devhub.com,3689118322',
                    'Miguel,Laker,mlaker25@reuters.com,7841165626',
                    'Read,Lindop,rlindop26@ustream.tv,7285113224',
                    'Ingar,Housaman,,3835383186',
                    'Osborne,Ilsley,,8083255217',
                    'Jeramey,Gozard,jgozard29@yolasite.com,2673327107',
                    'Marys,Sorton,msorton2a@sciencedirect.com,7199605011',
                    'Nate,Bachman,nbachman2b@dailymotion.com,2312622371',
                    'Bondie,Toe,btoe2c@sourceforge.net,5629568371',
                    'Ezequiel,Haugh,ehaugh2d@github.com,7585327661',
                    'Carin,Fyall,,9459733593',
                    'Jane,Pickworth,jpickworth2g@timesonline.co.uk,',
                    'Boothe,Daffern,bdaffern2h@comcast.net,9259530233',
                    'Cal,Hovert,chovert2i@answers.com,5595757076',
                    'Vicky,Grigolli,vgrigolli2j@utexas.edu,1172273214',
                    'Keely,Caldero,kcaldero2k@aboutads.info,8934809410',
                    'Suzette,Sim,ssim2l@ucoz.ru,7978038635',
                    'Kristo,Swanson,kswanson2m@ow.ly,9244250078',
                    'Helen,McVeagh,hmcveagh2n@i2i.jp,3343962509',
                    'Ilysa,Grandin,igrandin2o@dedecms.com,6972597571',
                    'Phaidra,Heal,,5459279888',
                    'Diana,Burtwistle,,5182960329'
                ])
            });
    });
});