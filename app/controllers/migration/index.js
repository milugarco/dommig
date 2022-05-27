const { Console, error } = require("console");
const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const mysql = require("mysql");
const path = require("path");
const router = express.Router();

const TotalValor = (data = []) => {
  var valor = 0;

  for (let index = 0; index < data.length; index++) {
    const element = data[index];

    valor = valor + element.VALORORI;
  }

  return valor;
};

const TotalValorP = (data = []) => {
  var valor = 0;

  for (let index = 0; index < data.length; index++) {
    const element = data[index];

    valor = valor + parseInt(element.PRECO);
  }

  return valor;
};

router.use(express.json());

router.get("/client", (req, resp) => {
  var XLSX = require("xlsx");
  var workbook = XLSX.readFile(
    path.join(__dirname, "arquivos", "cliente.xlsx")
  );
  var workbookMunicipio = XLSX.readFile(
    path.join(__dirname, "arquivos", "cidades.xlsx")
  );
  var sheet_name_list = workbook.SheetNames;
  var sheet_name_listMunicipo = workbookMunicipio.SheetNames;

  var arrayClientes = [];
  var arrayMunicipio = [];

  sheet_name_list.forEach(function (y) {
    var worksheet = workbook.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayClientes = data;
    //console.log(data);
  });

  sheet_name_listMunicipo.forEach(function (y) {
    var worksheet = workbookMunicipio.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayMunicipio = data;
    //console.log(data);
  });

  const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "excellent",
    insecureAuth: true,
    multipleStatements: true,
  });

  for (let index = 0; index < arrayClientes.length; index++) {
    const cliente = arrayClientes[index];
    
    let tipo = cliente.TIPO == "J" ? "Juridica" : "Fisica"
    
    let cidade = arrayMunicipio.filter(m => m.CODIGO == cliente.CIDADE);
    console.log(cidade);
    
    let fone = cliente.FONE ? `"${String(cliente.FONE).replaceAll(" ", "").substr(0, 13)}"` : "NULL"

    let celular = cliente.CELULAR ? `"${String(cliente.CELULAR).replaceAll(" ", "").substr(0, 14)}"` : "NULL"

    let query2 = `Insert into cad_cliente_fornecedor (Id, Pesseoa_J_F, tipo_cliente_fornecedor,
                  status, DT_Cad, Nome_Fantasia, CNPJ_CPF, Fone_Comerc, Fone_Cel, Endereco_rua_Av, Bairro, 
                  UF, Razao_social_SobreNome, Num_Endereco,Cod_Municipio, CEP) values ("${cliente.CODIGO}","${tipo}", "Cliente", 
                  "Ativo", "2022-03-12", "${cliente.NOME}", ${cliente.CPF ? `"${cliente.CPF}"` : cliente.CNPJ ? `"${cliente.CNPJ}"` : "NULL"},
                  ${fone}, ${celular}, "${cliente.ENDERECO ? cliente.ENDERECO : "Rua"}", ${cliente.BAIRRO ? `"${cliente.BAIRRO}"` : 'NULL'},
                  "PR", "${String(cliente.NOME).substring(0, 60)}", ${cliente.NUMERO ? `"${cliente.NUMERO}"` : "NULL"},
                  ${cidade[0].IBGEMUNI},"86870-000")`;

    connection.query(query2, (error, results, fields) => {
      if (error) {
        console.error(error.message);
        return true;
      }

      if (index == arrayClientes.length - 1) {
        resp.json({
          message: "Foi um sucesso"
        });
      }
    });
  }

  connection.end();
});

router.get("/mysqlcli", (req, resp) => {

  const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "solusys",
    insecureAuth: true,
    multipleStatements: true,
  });

  const connection2 = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "excellent",
    insecureAuth: true,
    multipleStatements: true,
  });


  let query2 = `Select Id, nome_cliente, ende_cliente, bairro_cliente, cep_cliente, tele_cliente, 
                cpf_cliente, cnpj_cliente, tipojuri_cliente, endereconumero from clientes`

  connection.query(query2, (error, results, fields) => {
    if (error) {
      console.log(error.message);
      return true;
    }

    for (let index = 0; index < results.length; index++) {
      const client = results[index];

      let tipo = client.tipojuri_cliente == "Pessoa Jurídica" ? "Juridica" : "Fisica"

      let query3 = `Insert into cad_cliente_fornecedor (Id, Pesseoa_J_F, tipo_cliente_fornecedor,
                  status, DT_Cad, Nome_Fantasia, CNPJ_CPF, Endereco_rua_Av, Bairro,   
                  UF, Razao_social_SobreNome, Num_Endereco, CEP) values 
                  ("${client.Id}","${tipo}", "Cliente", "ativo", "2022-05-19", "${client.nome_cliente}",
                  ${client.cpf_cliente ? `"${client.cpf_cliente}"` : client.cnpj_cliente ? `"${client.cnpj_cliente}"` : "NULL"},
                  "${client.ende_cliente}", "${client.bairro_cliente}", "PR", "${client.nome_cliente}",
                  "${client.endereconumero}", "${client.cep_cliente}" );`;

      connection2.query(query3, (error, results, fields) => {
        if (error) {
          console.error(error.message);
          return true;
        }

        if (index == results.length - 1) {
          resp.json({
            message: "Foi um sucesso",
          });
        }
      });
    }
  })


  connection.end();
});

router.get("/mysqlpro", (req, resp) => {

  const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "solusys",
    insecureAuth: true,
    multipleStatements: true,
  });

  const connection2 = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "excellent",
    insecureAuth: true,
    multipleStatements: true,
  });


  let query2 = `Select id, nome_produto, codbarras_produto, ref_produto, Precovenda_produto, 
                  precoprazo_produto, ncmsh, id_tributacao, unidade from produtos`

  connection.query(query2, (error, results, fields) => {
    if (error) {
      console.log(error.message);
      return true;
    }

    for (let index = 0; index < results.length; index++) {
      const produto = results[index];

      let query3 = `Insert into cad_produtos (Id, Descricao, Preco_Venda, Num_Tamanho, 
                  Preco_Venda_aP,Qtde_Atual,Id_Unidade_Media, Controla_Estoque,
                  NCM, Id_tributo, Tipo_Produto,ATpVenda, ativo) values 
                  ("${produto.id}","${produto.nome_produto}","${produto.Precovenda_produto}", "${produto.unidade}",
                  "${produto.precoprazo_produto}", "0", "1", "True", "${produto.ncmsh}", "${produto.id_tributacao}",
                  "P", "True", "A");`;

      connection2.query(query3, (error, results, fields) => {
        if (error) {
          console.error(error.message);
          return true;
        }

        if (index == results.length - 1) {
          resp.json({
            message: "Foi um sucesso",
          });
        }
      });
    }
  })


  connection.end();
});

router.get("/product", (req, resp) => {
  var XLSX = require("xlsx");
  var workbook = XLSX.readFile(
    path.join(__dirname, "arquivos", "produto.xlsx")
  );
  var sheet_name_list = workbook.SheetNames;

  var arrayProdutos = [];

  sheet_name_list.forEach(function (y) {
    var worksheet = workbook.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayProdutos = data;
    console.log(data);
  });

  const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "excellent",
    insecureAuth: true,
    multipleStatements: true,
  });

  for (let index = 0; index < arrayProdutos.length; index++) {
    const produto = arrayProdutos[index];

    let price = String(produto.PRECOVENDA).replace("000", "");
    let priceV = price == "" ? "0" : String(price) == "undefined" ? "0" : price;

    let query2 = `Insert into cad_produtos (Id, Descricao, Preco_Venda, Num_Tamanho, Preco_Venda_aP,
                  Qtde_Atual,Id_Unidade_Media, Controla_Estoque, NCM, Id_tributo, Tipo_Produto,
                  ATpVenda, ativo) values ("${produto.CODIGO}","${String(produto.DESCRICAO).substring(0, 60)}",
                  ${priceV}, "${produto.UNIDADE}", ${priceV},"0","1","True","${produto.NCM}","1","P","True","A");`;

    connection.query(query2, (error, results, fields) => {
      if (error) {
        console.error(error.message);
        return true;
      }

      if (index == arrayProdutos.length - 1) {
        resp.json({
          message: "Foi um sucesso",
        });
      }
    });
  }

  connection.end();
});

router.get("/venda/duplicata", (req, resp) => {
  const moment = require("moment");

  var XLSX = require("xlsx");
  var workbookRECEBER = XLSX.readFile(
    path.join(__dirname, "arquivos", "contareceber15.xlsx")
  );
  var workbookCUPOM = XLSX.readFile(
    path.join(__dirname, "arquivos", "cupom15.xlsx")
  );

  var workbookDUPLICATA = XLSX.readFile(
    path.join(__dirname, "arquivos", "duplicata15.xlsx")
  );

  var sheet_name_listRECEBER = workbookRECEBER.SheetNames;
  var sheet_name_listCUPOM = workbookCUPOM.SheetNames;
  var sheet_name_listDUPLICATA = workbookDUPLICATA.SheetNames;

  var arrayRECEBER = [];
  var arrayCUPOM = [];
  var arrayDUPLICATA = [];

  sheet_name_listRECEBER.forEach(function (y) {
    var worksheet = workbookRECEBER.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayRECEBER = data;
  });

  sheet_name_listCUPOM.forEach(function (y) {
    var worksheet = workbookCUPOM.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayCUPOM = data;
  });

  sheet_name_listDUPLICATA.forEach(function (y) {
    var worksheet = workbookDUPLICATA.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayDUPLICATA = data;
  });

  var result = [];

  for (let index = 0; index < arrayDUPLICATA.length; index++) {
    const duplicata = arrayDUPLICATA[index];

    if (
      arrayRECEBER.filter((receber) => receber.DUPLICATA == duplicata.CODIGO)
        .length > 0
    ) {
      result.push({
        ...duplicata,
        receber: arrayRECEBER.filter(
          (receber) => receber.DUPLICATA == duplicata.CODIGO
        ),
        cupom: arrayCUPOM.filter((cupom) => cupom.CUPOM == duplicata.CUPOM),
      });

      console.log(result);
    }
  }

  console.log(result);

  const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "excellent",
    insecureAuth: true,
    multipleStatements: true,
  });

  // console.log(result);
  // console.log(result.length);
  /* resp.json({
    message: "As vendas foram um sucesso",
    data: result,
  }); */

  for (let indexR = 0; indexR < result.length; indexR++) {
    const venda = result[indexR];
    /* MIGRA VENDA COM DUPLICATA */
    var valor = String(venda.VALOR).replace("000", "");

    valor = String(valor).length > 3 ? valor / 1000 : valor;

    let query2 = `Insert into gerenciador_vendas (Id_Cliente, Data, Prim_Vencimento, Qtde_Parc_Receber, Situacao, Vlr_Receber, Id_vendedor, Total_Bruto, hr)
                values (${venda.CLIENTE}, "${moment(
      venda.EMISSAO,
      "DD.MM.YYYY"
    ).format("YYYY-MM-DD")}","${moment(venda.VENCI1, "DD.MM.YYYY").format(
      "YYYY-MM-DD"
    )}",  ${venda.receber.length}, 1, ${valor}, 1, ${valor}, "12:00:00"  )`;

    connection.query(query2, (error, results, fields) => {
      if (error) {
        console.error(error.message);
        return true;
      }

      const vendaID = results.insertId;

      for (let index = 0; index < venda.cupom.length; index++) {
        const cupom = venda.cupom[index];
        console.log(cupom);
        const connection1 = mysql.createConnection({
          host: "127.0.0.1",
          port: 3309,
          user: "root",
          password: "dominus2011",
          database: "excellent",
          insecureAuth: true,
          multipleStatements: true,
        });

        var valorP = String(cupom.PRECO).replace("000", "");

        valorP = String(valorP).length > 3 ? valorP / 1000 : valorP;

        /* MIGRA OS ITENS VENDA */
        let query3 = `Insert into gerencia_itens_venda (Id_Venda,Id_Produto,Qtde,Preco,Desconto, Checado,Preco_Prazo,nItem,precoCusto,subTotal)
        values (${vendaID}, ${cupom.PRODUTO}, ${String(
          cupom.QUANTIDADE
        ).replace("000", "")}, ${String(cupom.PRECO).replace(
          "000",
          ""
        )}, 0, 0, ${valorP}, ${index + 1}, 0, ${parseFloat(valorP) *
        parseFloat(String(cupom.QUANTIDADE).replace("000", ""))
          })`;

        connection1.query(query3, (error, results, fields) => {
          if (error) {
            console.error(error.message);
            return true;
          }
        });

        connection1.end();
      }

      for (let index = 0; index < venda.receber.length; index++) {
        const parcela = venda.receber[index];
        const connection2 = mysql.createConnection({
          host: "127.0.0.1",
          port: 3309,
          user: "root",
          password: "dominus2011",
          database: "excellent",
          insecureAuth: true,
          multipleStatements: true,
        });
        console.log(parcela);

        var valorPa = String(parcela.VALORORI).replace("000", "");

        valorPa = String(valorPa).length > 3 ? valorPa / 1000 : valorPa;

        /* MIGRA PARCELAS  */
        let query4 = `Insert into parcelas_venda (Id_venda,Juros,Desconto,DT_Vencimento,Vlr_Original,Situacao,Checado,Vlr_Pago)
                    values (${vendaID}, 0,0,"${moment(
          parcela.VENCIMENTO,
          "DD.MM.YYYY"
        ).format("YYYY-MM-DD")}", ${valorPa}, "A Receber", 0, 0)`;

        console.log(query4);

        connection2.query(query4, (error, results, fields) => {
          if (error) {
            console.error(error.message);
            return true;
          }

          if (
            (indexR == result.length - 1) &
            (index == venda.receber.length - 1)
          ) {
            resp.json({
              message: "As vendas foram um sucesso",
            });
          }
        });

        connection2.end();
      }
    });
  }

  connection.end();
});

router.get("/venda/receberrecebida", (req, resp) => {
  const moment = require("moment");

  var XLSX = require("xlsx");
  var workbookRECEBER = XLSX.readFile(
    path.join(__dirname, "arquivos", "contareceber15.xlsx")
  );
  var workbookRECEBIDA = XLSX.readFile(
    path.join(__dirname, "arquivos", "contarecebida15.xlsx")
  );
  var workbookCUPOM = XLSX.readFile(
    path.join(__dirname, "arquivos", "cupom15.xlsx")
  );

  var sheet_name_listRECEBER = workbookRECEBER.SheetNames;
  var sheet_name_listRECEBIDA = workbookRECEBIDA.SheetNames;
  var sheet_name_listCUPOM = workbookCUPOM.SheetNames;

  var arrayRECEBER = [];
  var arrayRECEBIDA = [];
  var arrayCUPOM = [];

  sheet_name_listRECEBER.forEach(function (y) {
    var worksheet = workbookRECEBER.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayRECEBER = data;
    //console.log(data);
  });

  sheet_name_listRECEBIDA.forEach(function (y) {
    var worksheet = workbookRECEBIDA.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayRECEBIDA = data;
    //console.log(data);
  });

  sheet_name_listCUPOM.forEach(function (y) {
    var worksheet = workbookCUPOM.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayCUPOM = data;
    //console.log(data);
  });

  var vendas = [];
  var parcelas = [];
  var produtos = [];
  var cClient = "";
  var dEmissao = "";

  const arryRECEBER = arrayRECEBER.filter((r) => !r.DUPLICATA);
  const arryRECEBIDA = arrayRECEBIDA.filter((r) => !r.DUPLICATA);

  let arryNumCUPOM = arrayCUPOM.filter(function (a) {
    return (
      !this[JSON.stringify(a.CUPOM)] && (this[JSON.stringify(a.CUPOM)] = true)
    );
  }, Object.create(null));

  for (let index = 0; index < arryNumCUPOM.length; index++) {
    const cpm = arryNumCUPOM[index];

    if (cpm.CUPOM) {
      const rec = arryRECEBIDA.filter((r) => r.CUPOM == cpm.CUPOM);
      const recr = arryRECEBER.filter((r) => r.CUPOM == cpm.CUPOM);

      for (let index1 = 0; index1 < rec.length; index1++) {
        const recebida = rec[index1];

        parcelas.push({ ...recebida, isPag: true });
      }

      for (let index2 = 0; index2 < recr.length; index2++) {
        const receber = recr[index2];

        parcelas.push({ ...receber, isPag: false });
      }

      for (let index3 = 0; index3 < arrayCUPOM.length; index3++) {
        const cupom = arrayCUPOM[index3];

        if (cupom.CUPOM == cpm.CUPOM) {
          produtos.push(cupom);
        }
      }

      cClient =
        parcelas.length > 0
          ? parcelas[0].CLIENTE
          : cpm.CLIENTE
            ? cpm.CLIENTE
            : 1;
      dEmissao = parcelas.length > 0 ? parcelas[0].EMISSAO : cpm.DATA;

      vendas.push({
        CLIENTE: cClient,
        VALOR:
          parcelas.length > 0 ? TotalValor(parcelas) : TotalValorP(produtos),
        EMISSAO: dEmissao,
        parcelas: parcelas,
        produtos: produtos,
      });

      parcelas = [];
      produtos = [];
    }
  }

  // console.log(arrayCUPOM.filter((cupom) => cupom.CUPOM == duplicata.CUPOM));

  const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "excellent",
    insecureAuth: true,
    multipleStatements: true,
  });

  //console.log(vendas);
  // console.log(result.length);
  resp.json({
    message: "As vendas foram um sucesso",
    data: vendas,
  });

  /* for (let indexR = 0; indexR < vendas.length; indexR++) {
    const venda = vendas[indexR];
    let valor = venda.VALOR;

    valor = String(valor).replace("000", "");
    valor = valor.length > 3 ? valor / 1000 : valor;
    // MIGRA VENDA COM DUPLICATA

    let query2 = `Insert into gerenciador_vendas (Id_Cliente, Data, Prim_Vencimento, Qtde_Parc_Receber, Situacao, Vlr_Receber, Id_vendedor, Total_Bruto, hr)
                values (${venda.CLIENTE}, "${moment(
      venda.EMISSAO,
      "DD.MM.YYYY"
    ).format("YYYY-MM-DD")}","${
      venda.parcelas.length == 0
        ? "0000-00-00"
        : moment(venda.parcelas[0].VENCIMENTO, "DD.MM.YYYY").format(
            "YYYY-MM-DD"
          )
    }",  ${venda.parcelas.length}, 1, ${valor}, 1, ${valor}, "12:00:00"  )`;

    connection.query(query2, (error, results, fields) => {
      if (error) {
        console.error(error.message);
        return true;
      }

      const vendaID = results.insertId;

      for (let index = 0; index < venda.produtos.length; index++) {
        const produto = venda.produtos[index];
        const connection1 = mysql.createConnection({
          host: "127.0.0.1",
          port: 3309,
          user: "root",
          password: "dominus2011",
          database: "excellent",
          insecureAuth: true,
          multipleStatements: true,
        });

        let valor = String(produto.PRECO).replace("000", "");
        valor = valor.length > 3 ? valor / 1000 : valor;

        let quantidade = String(produto.QUANTIDADE).replace("000", "");

        // MIGRA OS ITENS VENDA
        let query3 = `Insert into gerencia_itens_venda (Id_Venda,Id_Produto,Qtde,Preco,Desconto, Checado,Preco_Prazo,nItem,precoCusto,subTotal)
        values (${vendaID}, ${
          produto.PRODUTO
        },${quantidade}, ${valor}, 0, 0, ${valor}, ${index + 1}, 0, ${
          valor * quantidade
        })`;

        console.log(query3);
        connection1.query(query3, (error, results, fields) => {
          if (error) {
            console.error(error.message);
            return true;
          }
        });

        connection1.end();
      }

      if ((venda.parcelas.length == 0) & (vendas.length - 1 == indexR)) {
        resp.json({
          message: "As vendas foram um sucesso",
        });
      } else {
        for (let index = 0; index < venda.parcelas.length; index++) {
          const parcela = venda.parcelas[index];

          let valor = String(parcela.VALORORI).replace("000", "");
          valor = valor.length > 3 ? valor / 1000 : valor;

          const connection2 = mysql.createConnection({
            host: "127.0.0.1",
            port: 3309,
            user: "root",
            password: "dominus2011",
            database: "excellent",
            insecureAuth: true,
            multipleStatements: true,
          });

          // console.log(parcela);

          // MIGRA PARCELAS
          let query4 = `Insert into parcelas_venda (Id_venda,Juros,Desconto,DT_Vencimento,Vlr_Original,Situacao,Checado,Vlr_Pago)
                    values (${vendaID}, 0,0,"${moment(
            parcela.VENCIMENTO,
            "DD.MM.YYYY"
          ).format("YYYY-MM-DD")}", ${valor}, "${
            parcela.isPag ? "Pago" : "A Receber"
          }", 0, 0)`;

          console.log(query4);

          connection2.query(query4, (error, results, fields) => {
            if (error) {
              console.error(error.message);
              return true;
            }

            if (
              (indexR == vendas.length - 1) &
              (index == venda.parcelas.length - 1)
            ) {
              resp.json({
                message: "As vendas foram um sucesso",
              });
            }
          });

          connection2.end();
        }
      }
    });
  } */

  connection.end();
});

router.get("/venda/receber", (req, resp) => {
  const moment = require("moment");

  var XLSX = require("xlsx");
  var workbookRECEBER = XLSX.readFile(
    path.join(__dirname, "arquivos", "contareceber15.xlsx")
  );

  var sheet_name_listRECEBER = workbookRECEBER.SheetNames;

  var arrayRECEBER = [];

  sheet_name_listRECEBER.forEach(function (y) {
    var worksheet = workbookRECEBER.Sheets[y];
    var headers = {};
    var data = [];
    for (z in worksheet) {
      if (z[0] === "!") continue;
      //parse out the column, row, and value
      var tt = 0;
      for (var i = 0; i < z.length; i++) {
        if (!isNaN(z[i])) {
          tt = i;
          break;
        }
      }
      var col = z.substring(0, tt);
      var row = parseInt(z.substring(tt));
      var value = worksheet[z].v;

      //store header names
      if (row == 1 && value) {
        headers[col] = value;
        continue;
      }

      if (!data[row]) data[row] = {};
      data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();

    arrayRECEBER = data;
    //console.log(data);
  });

  var vendas = [];
  var parcelas = [];
  var cClient = "";
  var dEmissao = "";
  const arryRECEBER = arrayRECEBER.filter((r) => !r.DUPLICATA);

  for (let index = 0; index < arryRECEBER.length; index++) {
    const parcela = arryRECEBER[index];

    if ((cClient == "") & (dEmissao == "")) {
      cClient = parcela.CLIENTE;
      dEmissao = parcela.EMISSAO;
    } else {
      if ((cClient !== parcela.CLIENTE) | (dEmissao !== parcela.EMISSAO)) {
        vendas.push({
          CLIENTE: cClient,
          VALOR: TotalValor(parcelas),
          EMISSAO: dEmissao,
          parcelas: parcelas,
        });

        parcelas = [];
      }
    }

    parcelas.push(parcela);

    if (parcela.CLIENTE == "4399") {
      console.log("AQUI", parcelas);
    }

    cClient = parcela.CLIENTE;
    dEmissao = parcela.EMISSAO;
  }

  //console.log(arrayCUPOM.filter((cupom) => cupom.CUPOM == duplicata.CUPOM));

  const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "excellent",
    insecureAuth: true,
    multipleStatements: true,
  });

  // console.log(result);
  // console.log(result.length);
  /* resp.json({
    message: "As vendas foram um sucesso",
    data: vendas,
  }); */

  for (let indexR = 0; indexR < vendas.length; indexR++) {
    const venda = vendas[indexR];
    // MIGRA VENDA COM DUPLICATA
    var valor = String(venda.VALOR).replace("000", "");

    valor = String(valor).length > 3 ? valor / 1000 : valor;

    let query2 = `Insert into gerenciador_vendas (Id_Cliente, Data, Prim_Vencimento, Qtde_Parc_Receber, Situacao, Vlr_Receber, Id_vendedor, Total_Bruto, hr)
                values (${venda.CLIENTE}, "${moment(
      venda.EMISSAO,
      "DD.MM.YYYY"
    ).format("YYYY-MM-DD")}","${moment(
      venda.parcelas[0].VENCIMENTO,
      "DD.MM.YYYY"
    ).format("YYYY-MM-DD")}",  ${venda.parcelas.length}, 1, ${String(
      venda.VALOR
    ).replace("000", "")}, 1, ${valor}, "12:00:00"  )`;

    connection.query(query2, (error, results, fields) => {
      if (error) {
        console.error(error.message);
        return true;
      }

      const vendaID = results.insertId;

      for (let index = 0; index < [1].length; index++) {
        const connection1 = mysql.createConnection({
          host: "127.0.0.1",
          port: 3309,
          user: "root",
          password: "dominus2011",
          database: "excellent",
          insecureAuth: true,
          multipleStatements: true,
        });

        var valorProd = String(venda.VALOR).replace("000", "");
        valorProd = String(valorProd).length > 3 ? valorProd / 1000 : valorProd;

        // MIGRA OS ITENS VENDA
        let query3 = `Insert into gerencia_itens_venda (Id_Venda,Id_Produto,Qtde,Preco,Desconto, Checado,Preco_Prazo,nItem,precoCusto,subTotal)
        values (${vendaID}, 1,1, ${valorProd}, 0, 0, ${valorProd}, ${index + 1
          }, 0, ${parseFloat(valorProd) * 1})`;

        //console.log(query3);
        connection1.query(query3, (error, results, fields) => {
          if (error) {
            console.error(error.message);
            return true;
          }
        });

        connection1.end();
      }

      if ((indexR == vendas.length - 1) & (venda.parcelas.length == 0)) {
        resp.json({
          message: "As vendas foram um sucesso",
        });
      } else {
        for (let index = 0; index < venda.parcelas.length; index++) {
          const parcela = venda.parcelas[index];
          const connection2 = mysql.createConnection({
            host: "127.0.0.1",
            port: 3309,
            user: "root",
            password: "dominus2011",
            database: "excellent",
            insecureAuth: true,
            multipleStatements: true,
          });

          var valorPar = String(parcela.VALORORI).replace("000", "");
          valorPar = String(valorPar).length > 3 ? valorPar / 1000 : valorPar;
          //console.log(parcela);

          // MIGRA PARCELAS
          let query4 = `Insert into parcelas_venda (Id_venda,Juros,Desconto,DT_Vencimento,Vlr_Original,Situacao,Checado,Vlr_Pago)
                      values (${vendaID}, 0,0,"${moment(
            parcela.VENCIMENTO,
            "DD.MM.YYYY"
          ).format("YYYY-MM-DD")}", ${valorPar}, "A Receber", 0, 0)`;

          connection2.query(query4, (error, results, fields) => {
            if (error) {
              console.error(error.message);
              return true;
            }

            if (
              (indexR == vendas.length - 1) &
              (index == venda.parcelas.length - 1)
            ) {
              resp.json({
                message: "As vendas foram um sucesso",
              });
            }
          });

          connection2.end();
        }
      }
    });
  }

  connection.end();
});

router.get("/mysqlvenda", (req, resp) => {

  const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "solusys",
    insecureAuth: true,
    multipleStatements: true,
  });

  const connection2 = mysql.createConnection({
    host: "127.0.0.1",
    port: 3309,
    user: "root",
    password: "dominus2011",
    database: "excellent",
    insecureAuth: true,
    multipleStatements: true,
  });


  let query2 = `Select Id, valor_receber, parcelas_receber, data_receber, Id_venda, 
                Id_cliente, vencimento_primeira from contas_receber`
  
  let query3 = `Select Id, Id_receber, valor_parcela, vencimento_parcela, status_parcela, numero_parcela,
                numero_da_parcela from itens_receber`
                
  let query4 = `Select Id, Id_venda, Id_produto, Quantidade, preco_produto, total, nomeproduto
                from itens_venda`

  connection.query(query2, (error, results, fields) => {
    if (error) {
      console.log(error.message);
      return true;
    }

    for (let index = 0; index < results.length; index++) {
      const produto = results[index];

      let query5 = `Insert into cad_produtos (Id, Descricao, Preco_Venda, Num_Tamanho, 
                  Preco_Venda_aP,Qtde_Atual,Id_Unidade_Media, Controla_Estoque,
                  NCM, Id_tributo, Tipo_Produto,ATpVenda, ativo) values 
                  ("${produto.id}","${produto.nome_produto}","${produto.Precovenda_produto}", "${produto.unidade}",
                  "${produto.precoprazo_produto}", "0", "1", "True", "${produto.ncmsh}", "${produto.id_tributacao}",
                  "P", "True", "A");`;

      connection2.query(query3, (error, results, fields) => {
        if (error) {
          console.error(error.message);
          return true;
        }

        if (index == results.length - 1) {
          resp.json({
            message: "Foi um sucesso",
          });
        }
      });
    }
  })


  connection.end();
});

module.exports = router;
