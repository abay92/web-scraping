const { Validator } = require('node-input-validator')
const cheerio = require('cheerio')
const got = require('got')

exports.index = function(req, res){
  (async () => {
    // validation form
    const validation = new Validator(req.body, {
      url: 'required|url',
    })
    const checkValidation = await validation.check()
    if (!checkValidation) {
      return res.status(422).send({
        message: validation.errors,
        data: null
      })
    }

    const getUrl = ($url) => {
      var url = $url.split( '//' );
      if (url[0] === "http:" || url[0] === "https:") {
        var protocol = url[0] + "//";
        var host = url[1].split( '/' )[0];
        url = protocol + host;
        var path = $url.split(url)[1];
        return {
          protocol: protocol,
          host: host,
          path: path
        };
      }

      return null
    }

    const url = getUrl(req.body.url)

    if (!url) {
      return res.status(422).send({
        message: 'silahkan tambahkan http//:www. atau https//:www. diawal parameter url',
        data: null
      })
    } else {
      const response = await got(req.body.url)
      const $ = cheerio.load(response.body)

      const getProduct = (name, prices, images) => {
        return {
          name: name,
          prices: prices,
          images: images,
        }
      }

      var product = getProduct(null,null,null)

      if (url.host == 'www.ebay.com' || url.host == 'ebay.com') {
        var images = []
        $('div#vi_main_img_fs ul').each(function (_, item){
          $(item).find('img').each(function(_, img) {
            images.push($(img).attr('src'))
          })
        })

        var product = getProduct(
          ($('h1#itemTitle').text()).replace('Details about   ', ''),
          {
            price_origin: $('span#mm-saleOrgPrc').text(),
            discount: ($('div#mm-saleAmtSavedPrc').text()).replace('\n\t\t\t\t\t\t', ''),
            price_discount: $('span#mm-saleDscPrc').text()
          },
          images
        )
      }

      return res.send({
        message: 'success',
        data: { product }
      })
    }
  })()
}