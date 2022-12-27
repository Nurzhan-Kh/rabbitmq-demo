import { connect } from "amqplib";

const run = async function () {
    try {
        //создаем connection
        const connection = await connect('amqp://localhost');
        //создаем канал
        const channel = await connection.createChannel();
        //создаем Exchange
        await channel.assertExchange('test', 'topic', {durable: true});
        //создаем очередь обратного ответа
        //первый параметр пустой значит Rabbit сгенерит уникальное имя
        //exclusive=true значит после завершения работы микросервиса очередь уничтожится
        const replyQueue = await channel.assertQueue('', {exclusive: true});
        //слушаем очередь обратного ответа
        channel.consume(replyQueue.queue, (message) => {
            console.log(message?.content.toString());
            console.log(message?.properties.correlationId);
        })
        //Публикуем сообщение     
        channel.publish('test', 'my.command', Buffer.from('Работает!'),{replyTo: replyQueue.queue , correlationId: '1'});
    } catch (e) {
        console.error(e);
    }
    
};

run();