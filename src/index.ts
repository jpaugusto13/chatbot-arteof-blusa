import { create, Whatsapp, Message } from 'venom-bot';
import { createClient, DeepgramResponse, SyncPrerecordedResponse  } from "@deepgram/sdk";
import fs from 'fs';
import path from 'path';
import api from './services/api';

const deepgram = createClient('0f1095c49fe3c419f8cb970f25d280e58e9a892c');

create({ session: 'arteof-blusa' }).then((client) => start(client));

const atendente = "558597373785@c.us"
const clients = new Set();
const perguntasFrequentes = new Set();
const atendimentoOrcamento = new Set();
const clientName = new Set();
const verifyName = new Set();
let cliente = {} as ArrayClientes
const lockedBot = new Set();

type ArrayClientes = {
  id_serial_key?: number;
  nome: string;
  numero_cliente: string;
}
const messageProducts = "Temos disponível em todo nosso catálogo os seguints produtos:\n\n[1] - Gola Polo\n[2] - Manga Curta\n[3] - Manga Longa\n[4] - Regata\n[5] - Boné\n[6] - Bandeira\n[7] - Material Esportivo\n[8] - Capa de Barbeiro";
const messagePerguntasFrequentes = "Perguntas frequentes\n\n[1] - Quais tipos de fardamentos e blusas personalizadas vocês oferecem?\n[2] - Quais materiais são utilizados na confecção dos produtos?\n[3] - Posso personalizar o design do meu fardamento ou blusa?\n[4] - Qual é o prazo de entrega dos pedidos?\n[5] - Vocês aceitam pedidos em grandes quantidades?\n[6] - Fazer orçamento e entrar em atendimento ao cliente"
const start = async (client: Whatsapp) => {
  
  client.onMessage(async (message: Message) => {
    if(message.isGroupMsg) return 0;
    if(lockedBot.has(message.from)) {
      
    }

    const getName = async (numberClient: string) => {
      let clientes : Array<ArrayClientes> = await api.get("/clientes").then(response => response.data.clientes);
      let name: string;

      if(clientes.length !== 0 ) {
        let response = clientes.filter(({ numero_cliente }) => numero_cliente === numberClient );
        if(response.length !== 0 ) name = response[0].nome;
      }

      return name;
    }

    let name = await getName(message.from);
    if (name == "") {
      if(!clients.has(message.from)) {
        clients.add(message.from);
        await client.sendText(message.from,`Olá, boa noite! Verifiquei aqui que é a primeira vez que você entra em contato conosco!\n\nComo eu posso te chamar?\n\n*Obs: Digite apenas o seu nome*`)
      } else {
        
        let text = String(message.body.toLowerCase());
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        text = text.replace('ç', 'c');
        
        if(text === "1" || text === "nao") {
          await client.sendText(message.from, `Aah tudo bem então, como eu posso te chamar?`)
          verifyName.delete(message.from);
          return "";
        }
        
        if(text === "2" || text === "sim") {
          clientName.add(message.from);
          await api.post("/adicionar-cliente", cliente);
          await client.sendText(message.from, `Vou te chamar de ${await getName(message.from)}`)
    
          await client.sendText(message.from,`${await getName(message.from)} seja muito bem-vindo à Arteof Fardamentos e blusas personalizadas. Explore nossas opções e conte conosco para qualquer ajuda.`)
    
          await client.sendText(message.from, messagePerguntasFrequentes);
          return "";
        }
        
        if(!verifyName.has(message.from)) {
          cliente = {
            nome: message.body, 
            numero_cliente: message.from
          }
  
          verifyName.add(message.from);
          await client.sendText(message.from,`Posso te chamar de ${message.body} ?\n[1] - Não\n[2] - Sim`);
  
        } else {
  
    
          await client.sendText(message.from, "Desculpe, mas não entendi bem o que você falou!");
    
          await client.sendText(message.from,`Posso te chamar de ${await getName(message.from)} ?\n[1] - Não\n[2] - Sim`);
  
        }
      }

    } else {
      if(!clients.has(message.from)) {
        await client.sendText(message.from,`Olá, ${await getName(message.from)}!\n que bom que você voltou à Arteof Fardamentos e blusas personalizadas. Explore nossas opções e conte conosco para qualquer ajuda.`)
        await client.sendText(message.from, messagePerguntasFrequentes);
        clients.add(message.from);
      } else {
          // IF PARA TODAS AS MENSAGENS VALIDADAS
          if (message.type === "chat") {
            let text = String(message.body.toLowerCase());
            
            text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            text = text.replace('ç', 'c');
            
            if (text.includes('pix')) {
        
              await client.sendText(message.from, 'Pix - telefone numero da loja 📞\n 85992172541\nFrancisco Paulo Pereira \n\nPagBank \n\nNos envia o comprovante após o pagamento. ☺️🩵');
              return "";
            }
            
            if (text.includes('endereco') || text.includes('localizacao') || text.includes('localisacao')) {
        
              await client.sendText(message.from, 'O nosso endereço é Rua Antônio Alencar - 1001\nBairro: Coqueiral - Maracanaú\n\nPonto de referência em frente o túnel');
              await client.sendLocation(message.from, '-3.8707611117363667', '-38.622345097609646', 'Rua Antônio Alencar - 1001');
              return "";
            }
            
            if(text === "0") {
        
              await client.sendText(message.from, "Entendi, você deseja falar com um de nossos atendentes.\n\nAguarde alguns instantes...")
        
              await client.sendText(atendente, "Olá, boa noite tem uma pessoa tentando entrar em contato com você, vou está mandando o contato para você");
              await client.sendContactVcard(atendente, message.from, message.sender.pushname);
              return "";
            }
            
            if(!perguntasFrequentes.has(message.from)) {
        
              if (text === '1') {
          
                await client.sendText(message.from, "Oferecemos uniformes escolares, corporativos, esportivos e industriais. Também produzimos blusas personalizadas para eventos, campanhas.")
                return "";
              }
              
              if (text === '2') {
          
                await client.sendText(message.from, "Utilizamos materiais de alta qualidade, como algodão, poliéster e misturas de tecidos, garantindo conforto e durabilidade.\n\nLista de tecidos\n(1) - Helanca\n(2) - Dry-fit\n(3) - Piquet")
                return "";
              }
              
              if (text === '3') {
          
                await client.sendText(message.from, "Sim, oferecemos personalização com cores, logos, textos e gráficos. Nosso time de design pode ajudar a criar o visual perfeito.");
                return "";
              }
              
              if (text === '4') {
          
                await client.sendText(message.from, "Normalmente, leva de 10 a 20 dias úteis após a confirmação do design e pagamento.");
                return "";
              }
              
              if (text === '5') {
          
                await client.sendText(message.from, "Sim, aceitamos pedidos em grandes quantidades e oferecemos preços especiais para compras em volume, o mínimo do pedido são 6 peças.");
                return "";
              }
      
              if (text === '6') {
          
                perguntasFrequentes.add(message.from);
                atendimentoOrcamento.add(message.from);
                await client.sendText(message.from, `Você entrou em atendimento ao cliente ${await getName(message.from)}`);
                await client.sendText(message.from, messageProducts)
                return "";
              }
              
              if (text === '7') {
          
                await client.sendText(message.from, "Aceitamos pix, dinheiro em espécie.");
                return "";
              }
              
        
              await client.sendText(message.from, "Desculpe mas não entendi bem o que você falou, para que todas suas dúvidas possam ser tiradas você pode usar nossa lista de perguntas frequentes!");
              await client.sendText(message.from,`Perguntas frequentes\n\n[1] - Quais tipos de fardamentos e blusas personalizadas vocês oferecem?\n[2] - Quais materiais são utilizados na confecção dos produtos?\n[3] - Posso personalizar o design do meu fardamento ou blusa?\n[4] - Qual é o prazo de entrega dos pedidos?\n[5] - Vocês aceitam pedidos em grandes quantidades?\n[6]- Quais são as opções de pagamento disponíveis?`);
              await client.sendText(message.from,`Caso sua dúvida não esteja presente na nossa lista de perguntas frequentes, você pode solicitar um de nossos atendentes.\n\n[0] - Solicitar um atendente.`);
            } else {
              if(atendimentoOrcamento.has(message.from)) {
          
                switch(text) {
                  case "1": {
              
                    await client.sendText(message.from, "Você gostaria de fechar um pedido de blusas Gola Polo?")
                    break
                  }
                  case "2": {
              
                    await client.sendText(message.from, "Você gostaria de fechar um pedido de blusas Manga Curta ?");
                    break;
                  }
                  case "3": {
              
                    await client.sendText(message.from, "Você gostaria de fechar um pedido de blusas Manga Longa ?");
                    break;
                  }
                  case "4": {
              
                    await client.sendText(message.from, "Você gostaria de fechar um pedido de blusas Regata ?");
                    break;
                  }
                  case "5": {
              
                    await client.sendText(message.from, "Você gostaria de fechar um pedido de Bonés ?")
                    break
                  }
                  case "6": {
              
                    await client.sendText(message.from, "Você gostaria de fechar um pedido de Badeiras ?")
                    break
                  }
                  case "7": {
              
                    await client.sendText(message.from, "Você gostaria de fechar um pedido de Painel ?")
                    break
                  }
                  case "8": {
              
                    await client.sendText(message.from, "Você gostaria de fechar um pedido de Capa de barbeiro ?")
                    break
                  }
                  default: {
              
                    await client.sendText(message.from, "Desculpe mas não entendi bem o que você falou, para que todas suas dúvidas possam ser tiradas você pode usar nossa lista de perguntas frequentes!");
              
                    await client.sendText(message.from, messageProducts)
                  }
                }
    
              }
            }
          }
          if (message.type === 'ptt') {
            try {
              const buffer = await client.decryptFile(message);
      
              const fileName = `audio_${Date.now()}.ogg`;
              const filePath = path.join(__dirname, fileName);
      
              const transcribeAudio = async (filePath: string) => {
                const file : Buffer = fs.readFileSync(filePath);
                const response : DeepgramResponse<SyncPrerecordedResponse> = await deepgram.listen.prerecorded.transcribeFile(file, { punctuate: true , sentiment: true});
                console.log('Transcrição:', response.result.results.channels[0].alternatives);
              }
            
              fs.writeFile(filePath, buffer, async (err) => {
                if (err) {
                  console.error('Erro ao salvar o áudio:', err);
                  return;
                }
                
                console.log(`Áudio salvo como ${fileName}`);
                await transcribeAudio(`./src/${fileName}`);
                
              });
      
            } catch (error) {
              console.error('Erro ao descriptografar o arquivo:', error);
            }
          }
        }
      }
  });
};
