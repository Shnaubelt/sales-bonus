/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  const { discount, sale_price, quantity } = purchase;
  const discountCoefficient = 1 - purchase.discount / 100;
  const revenue = sale_price * quantity * discountCoefficient;
  return revenue;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  const { profit } = seller;
  if (index === 0) {
    return seller.profit * 0.15;
  } else if (index === 1 || index === 2) {
    return seller.profit * 0.1;
  } else if (index === total - 1) {
    return 0;
  } else {
    return seller.profit * 0.05;
  }
}

/**
 * Функция для анализа данных продаж
 * @param data данные
 * @param options две прошлые функции
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  if (!data) {
    throw new Error("Некорректные входные данные");
  }

  if (
    !data.customers ||
    !Array.isArray(data.customers) ||
    data.customers.length === 0
  ) {
    throw new Error("Некорректные данные покупателей");
  }

  if (
    !data.products ||
    !Array.isArray(data.products) ||
    data.products.length === 0
  ) {
    throw new Error("Некорректные данные продуктов");
  }

  if (
    !data.sellers ||
    !Array.isArray(data.sellers) ||
    data.sellers.length === 0
  ) {
    throw new Error("Некорректные данные продавцов");
  }

  if (
    !data.purchase_records ||
    !Array.isArray(data.purchase_records) ||
    data.purchase_records.length === 0
  ) {
    throw new Error("Некорректные данные продаж");
  }
  // @TODO: Проверка входных данных

  // @TODO: Проверка наличия опций
  const { calculateRevenue, calculateBonus } = options;

  if (typeof calculateRevenue !== "function") {
    throw new Error("опция calculateRevenue не является функцией");
  }

  if (typeof calculateBonus !== "function") {
    throw new Error("опция calculateBonus не является функцией");
  }
  // @TODO: Проверка наличия опций

  // @TODO: Подготовка промежуточных данных для сбора статистики
  const sellerStats = data.sellers.map((seller) => ({
    ...seller,
    revenue: 0,
    top_products: 0,
    bonus: 0,
    sales_count: 0,
    profit: 0,
  }));
  // @TODO: Подготовка промежуточных данных для сбора статистики

  // @TODO: Индексация продавцов и товаров для быстрого доступа
  const sellerIndex = Object.fromEntries(
    sellerStats.map((seller) => [seller.id, seller]),
  );

  const productIndex = Object.fromEntries(
    data.products.map((product) => [product.sku, product]),
  );
  // @TODO: Индексация продавцов и товаров для быстрого доступа

  // @TODO: Расчет выручки и прибыли для каждого продавца
  data.purchase_records.forEach((record) => {
    const seller = sellerIndex[record.seller_id];
    seller.sales_count += 1;
    seller.revenue += record.total_amount;

    record.items.forEach((item) => {
      const product = productIndex[item.sku];
      const cost = product.purchase_price * item.quantity;
      const revenue = calculateRevenue(item, product);
      const profit = revenue - cost;
      seller.profit += profit;

      if (!seller.products_sold) {
        seller.products_sold = {};
      }
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;
    });
  });
  // @TODO: Расчет выручки и прибыли для каждого продавца

  // @TODO: Сортировка продавцов по прибыли
  sellerStats.sort((sellerA, sellerB) => {
    return -1 * (sellerA.profit - sellerB.profit);
  });
  // @TODO: Сортировка продавцов по прибыли

  // @TODO: Назначение премий на основе ранжирования
  sellerStats.forEach((seller, index) => {
    const total = sellerStats.length;
    seller.bonus = calculateBonus(index, total, seller);
    seller.top_products = Object.entries(seller.products_sold)
      .map(([sku, quantity]) => ({ sku, quantity }))
      .sort((a, b) => -1 * (a.quantity - b.quantity))
      .slice(0, 10);
  });
  // @TODO: Назначение премий на основе ранжирования

  // @TODO: Подготовка итоговой коллекции с нужными полями
  return sellerStats.map((seller) => ({
    seller_id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2),
  }));
  // @TODO: Подготовка итоговой коллекции с нужными полями
}
