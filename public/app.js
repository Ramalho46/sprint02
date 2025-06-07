const apiUrl = 'https://obscure-space-system-wr5ww49xv6gw3wjg-3000.app.github.dev/';

    const tableVendas = document.getElementById("tableVendas");
    const mensagem = document.getElementById("msg");

    function displayMessage(text, tipo = 'warning') {
      mensagem.innerHTML = `<div class="alert alert-${tipo}">${text}</div>`;
    }

    function criarLinhaVazia() {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="number" class="form-control inputCodigo" placeholder="Código"></td>
        <td colspan="5"></td>
      `;
      tableVendas.appendChild(row);
      row.querySelector('.inputCodigo').focus();
    }

    function inserirCodigo(input) {
      const codigo = input.value;
      if (!codigo) return;

      fetch(`${apiUrl}produtos?codigo=${codigo}`)
        .then(res => res.json())
        .then(produtos => {
          const linha = input.closest('tr');
          if (produtos.length > 0) {
            const produto = produtos[0];
            const preco = parseFloat(produto.preco);
            const quantidade = 1;
            const total = preco * quantidade;

            linha.innerHTML = `
              <td><input type="number" class="form-control" value="${produto.codigo}" readonly></td>
              <td>${produto.descricao}</td>
              <td>${produto.und}</td>
              <td><input type="number" class="form-control" value="${quantidade}" min="1" onchange="atualizarTotal(this, ${preco})"></td>
              <td>${preco.toFixed(2)}</td>
              <td class="total">${total.toFixed(2)}</td>
            `;
            criarLinhaVazia();
          } else {
            linha.innerHTML = `
              <td><input type="number" class="form-control inputCodigo" placeholder="${codigo}"></td>
              <td colspan="5" class="text-danger text-center">Produto não encontrado</td>
            `;
            linha.querySelector('.inputCodigo').focus();
          }
        })
        .catch(() => {
          const linha = input.closest('tr');
          linha.innerHTML = `
            <td><input type="number" class="form-control inputCodigo" placeholder="Código"></td>
            <td colspan="5" class="text-danger text-center">Erro ao buscar produto</td>
          `;
        });
    }

    function atualizarTotal(input, preco) {
      const quantidade = parseInt(input.value);
      const linha = input.closest('tr');
      const totalTd = linha.querySelector('.total');
      totalTd.textContent = (quantidade * preco).toFixed(2);
    }

    function salvarVenda() {
      const linhas = tableVendas.querySelectorAll('tr');
      let itens = [];

      linhas.forEach((linha) => {
        const celulas = linha.querySelectorAll('td');
        if (celulas.length < 6) return;

        const inputCodigo = celulas[0].querySelector('input');
        if (!inputCodigo || inputCodigo.value === '' || !inputCodigo.hasAttribute('readonly')) return;

        const codigo = inputCodigo.value;
        const descricao = celulas[1].textContent;
        const und = celulas[2].textContent;
        const quantidade = parseInt(celulas[3].querySelector('input').value);
        const preco = parseFloat(celulas[4].textContent);
        const total = parseFloat(celulas[5].textContent);

        itens.push({ codigo, descricao, und, quantidade, preco, total });
      });

      if (itens.length === 0) {
        displayMessage("Nenhum item válido para salvar.", "warning");
        return;
      }

      const venda = {
        vendedor: "joão",
        num_pedido: Date.now().toString().slice(-6),
        data: new Date().toLocaleDateString('pt-BR'),
        pagamento: "pix",
        itens
      };

      fetch(`${apiUrl}vendas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venda)
      })
        .then(res => {
          if (!res.ok) throw new Error("Erro ao salvar venda.");
          return res.json();
        })
        .then(() => {
          tableVendas.innerHTML = '';
          criarLinhaVazia();
          displayMessage("Venda salva com sucesso!", "success");
        })
        .catch(() => {
          displayMessage("Erro ao salvar venda. Tente novamente.", "danger");
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
      tableVendas.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('inputCodigo') && e.key === 'Enter') {
          inserirCodigo(e.target);
        }
      });

      document.getElementById('btnSalvar').addEventListener('click', salvarVenda);
      criarLinhaVazia();
    });